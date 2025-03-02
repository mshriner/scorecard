import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of } from 'rxjs';
import { Course, COURSE_EXAMPLE, CourseDTO } from '../models/course';
import { DataToShare, ExportedItem, ImportType } from '../models/data-transfer';
import { Round, RoundDTO } from '../models/round';
import { User, UserDTO } from '../models/user';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  public readonly CAN_SHARE_DATA = this.canBrowserShareData('test');
  public readonly CAN_SHARE_FILES = this.canBrowserShareFiles();

  constructor(private appStateService: AppStateService) {}

  private canBrowserShareData(data: any): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    return navigator.canShare({ text: JSON.stringify(data) });
  }

  public shareData(dataToShare: DataToShare): Observable<boolean> {
    if (
      !this.CAN_SHARE_DATA ||
      !this.CAN_SHARE_FILES ||
      !this.appStateService?.currentUser()
    ) {
      return of(false);
    }

    try {
      const exportedItem: ExportedItem = {
        ...dataToShare.data,
        objectType: dataToShare.objectType,
        fromProfileId: this.appStateService.currentUser()!.id,
        fromProfileName: this.appStateService.currentUser()!.name,
      };

      const shareFileName = dataToShare.objectType;

      const toShare = {
        title: `Exported ${shareFileName}`,
        files: [
          new File([JSON.stringify(exportedItem)], `${shareFileName}.json`, {
            type: 'application/json',
          }),
        ],
      };
      console.log(
        navigator.canShare(toShare),
        navigator.userActivation.isActive,
        navigator.userActivation.hasBeenActive,
      );
      return from(navigator.share(toShare)).pipe(
        map(() => true),
        catchError((e) => {
          // The data could not be shared.
          console.error(
            `Error: ${e}`,
            navigator.userActivation.isActive,
            navigator.userActivation.hasBeenActive,
          );
          return of(false);
        }),
      );
      // The data was shared successfully.
    } catch (e) {
      // The data could not be shared.
      console.error(`Error: ${e}`);
      return of(false);
    }
  }

  private canBrowserShareFiles(): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    // Create some test data with a file, to check if the browser supports
    // sharing it.
    const testFile = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    const data = { files: [testFile] };

    return navigator.canShare(data);
  }

  public convertDTOToDomain(
    importedItem: CourseDTO | RoundDTO | UserDTO,
  ): Course | Round | User | null {
    const { fromProfileName, fromProfileId, objectType, ...domain } =
      importedItem;

    // only take the properties we want to avoid importing garbage
    switch (objectType) {
      case 'course': {
        const domainCourse = {} as Course;
        Object.keys(COURSE_EXAMPLE).forEach((key) => {
          if (domain[key] !== undefined) domainCourse[key] = domain[key];
        });
        return domainCourse;
      }
      // TODO parse more complex objects (such as round containing courses)
      default:
        return null;
    }
  }

  /**
   * add to web manifest
   * 
  "share_target": {
    "action": "scorecard",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "course",
          "accept": [
            "application/json",
            ".json"
          ]
        }
      ]
    }
  },
   */
}
