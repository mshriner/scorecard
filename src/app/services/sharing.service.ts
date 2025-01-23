import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { User, UserDTO } from '../models/user';
import { AppStateService } from './app-state.service';
import { ExportedItem, ImportType } from '../models/data-transfer';
import { Course, CourseDTO } from '../models/course';
import { Round, RoundDTO } from '../models/round';

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

  public shareData(data: any, shareFileName: string): Observable<boolean> {
    if (
      !this.CAN_SHARE_DATA ||
      !this.CAN_SHARE_FILES ||
      !this.appStateService?.currentUser
    ) {
      return of(false);
    }

    try {
      const exportedItem: ExportedItem = {
        ...data,
        fromProfileId: this.appStateService.currentUser.id,
        fromProfileName: this.appStateService.currentUser.name,
      };

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
    typeOfImport: ImportType
  ): Course | Round | User {
    const { fromProfileName, fromProfileId, ...domain } = importedItem;
    return domain;
  }

  /**
   * add to web manifest
   * 
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
