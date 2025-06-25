import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of } from 'rxjs';
import {
  Course,
  COURSE_EXAMPLE,
  CourseDTO,
  CourseVariety,
} from '../models/course';
import {
  DataToShare,
  ExportedItem,
  RoundWithCourse,
} from '../models/data-transfer';
import {
  Round,
  ROUND_EXAMPLE,
  ROUND_NOTES_MAX_LENGTH,
  RoundDTO,
} from '../models/round';
import { UserDTO } from '../models/user';
import { DataUtils } from '../util/data-utils';
import { AppStateService } from './app-state.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  public readonly CAN_SHARE_DATA = this.canBrowserShareData('test');
  public readonly CAN_SHARE_FILES = this.canBrowserShareFiles();
  private readonly DATE_PIPE = new DatePipe('en-US');
  private readonly IMPORTED_MESSAGE = ' (imported)';

  constructor(
    private readonly appStateService: AppStateService,
    private readonly snackBarService: SnackBarService,
  ) {}

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
      const exportedItem: ExportedItem | null =
        this.convertDomainToDTO(dataToShare);

      if (!exportedItem) {
        this.snackBarService.openTemporarySnackBar(
          'Error: Could not convert data to share',
        );
        return of(false);
      }

      const shareFileName = this.getShareFileName(dataToShare);

      const toShare = {
        title: `Exported ${shareFileName}`,
        files: [
          new File([JSON.stringify(exportedItem)], `${shareFileName}.json`, {
            type: 'application/json',
          }),
        ],
      };
      console.log(
        `Sharing ${shareFileName} with data ${JSON.stringify(exportedItem)}`,
      );
      return from(navigator.share(toShare)).pipe(
        map(() => true),
        catchError((e) => {
          // The data could not be or was not shared.
          if (e.name === 'AbortError') {
            this.snackBarService.openTemporarySnackBar('Sharing was cancelled');
          } else {
            this.snackBarService.openTemporarySnackBar(`${e}`);
          }
          return of(false);
        }),
      );
      // The data was shared successfully.
    } catch (e) {
      // The data could not be shared.
      this.snackBarService.openTemporarySnackBar(`${e}`);
      return of(false);
    }
  }

  private getShareFileName(dataToShare: DataToShare) {
    switch (dataToShare.objectType) {
      case 'course': {
        const exportedCourseName = (dataToShare.data as Course)?.name
          ?.trim()
          ?.replace(/\s+/g, '-');
        return `course-${exportedCourseName}`;
      }
      case 'round': {
        const roundWithCourse = dataToShare.data as RoundWithCourse;
        const roundDate = this.DATE_PIPE.transform(
          roundWithCourse?.round?.dateStringISO,
          'MM-dd',
        );
        const exportedCourseName = roundWithCourse?.course?.name
          ?.trim()
          .replace(/\s+/g, '-');
        return `round-on-${roundDate}-at-${exportedCourseName}`;
      }
      default:
        return 'unknown';
    }
  }

  public convertDomainToDTO(
    dataToShare: DataToShare,
  ): CourseDTO | RoundDTO | null {
    const currentUser = this.appStateService.currentUser();

    const metadataDTO = {
      objectType: dataToShare.objectType,
      fromProfileId: currentUser?.id ?? '',
      fromProfileName: currentUser?.name ?? '',
    };

    if (dataToShare.objectType === 'course') {
      return { ...dataToShare.data, ...metadataDTO } as CourseDTO;
    }

    if (dataToShare.objectType === 'round') {
      return {
        ...(dataToShare.data as RoundWithCourse).round,
        courseDTO: dataToShare.data.course,
        ...metadataDTO,
      } as RoundDTO;
    }

    return null;
  }

  public convertDTOToDomain(
    importedItem: CourseDTO | RoundDTO | UserDTO,
  ): DataToShare | null {
    try {
      const { fromProfileName, fromProfileId, objectType, ...domain } =
        importedItem;

      // only take the properties we want to avoid importing garbage
      if (!domain) {
        console.error('Missing domain in imported item');
        return null;
      }
      if (!objectType) {
        console.error('Missing objectType in imported item');
        return null;
      }
      switch (objectType) {
        case 'course': {
          const importedCourse = this.parseCourse(domain as CourseDTO);
          if (!importedCourse) {
            return null;
          }
          return { data: importedCourse, objectType };
        }
        case 'round': {
          const importedRound = this.parseRound(domain as RoundDTO);

          if (!importedRound?.course || !importedRound?.round) {
            return null;
          }

          importedRound.round.id = DataUtils.generateUUID(objectType);
          return {
            data: importedRound,
            objectType,
          };
        }
        // future: parse more complex objects (such as user containing rounds and courses)
        default:
          return null;
      }
    } catch (e) {
      console.error(`Error: ${e}`);
      return null;
    }
  }

  private parseRound(roundDTO: RoundDTO): RoundWithCourse | null {
    const importedRound = {} as Round;
    let valid = true;
    if (!roundDTO.generalNotes?.length) {
      roundDTO.generalNotes = '';
    }
    Object.keys(ROUND_EXAMPLE).forEach((key) => {
      if (roundDTO[key] !== undefined) {
        importedRound[key] = roundDTO[key];
      } else {
        valid = false;
      }
    });
    if (!valid) {
      return null;
    }
    const importedCourse = this.parseCourse(roundDTO.courseDTO);
    if (!importedCourse) {
      return null;
    }
    if (
      (importedRound?.generalNotes?.length || 0) <
      ROUND_NOTES_MAX_LENGTH - this.IMPORTED_MESSAGE.length
    ) {
      importedRound.generalNotes =
        `${importedRound.generalNotes || ''}${this.IMPORTED_MESSAGE}`.trim();
    }
    return {
      round: importedRound,
      course: importedCourse,
    };
  }

  private parseCourse(domain: CourseDTO): Course | null {
    const importedCourse = {} as Course;
    let valid = true;
    if (
      (domain?.par?.length !== 18 && domain?.par?.length !== 9) ||
      domain?.par.some((p) => p < 1)
    ) {
      return null;
    }
    if (!domain?.numberOfHoles) {
      domain.numberOfHoles =
        domain?.par?.length === 9 ? CourseVariety.NINE : CourseVariety.EIGHTEEN;
    }
    Object.keys(COURSE_EXAMPLE).forEach((key) => {
      if (domain[key] !== undefined) {
        importedCourse[key] = domain[key];
      } else {
        valid = false;
      }
    });
    if (!valid) {
      return null;
    }
    importedCourse.name = `${importedCourse.name}${this.IMPORTED_MESSAGE}`;
    return importedCourse;
  }

  private canBrowserShareFiles(): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    const testFile = new File(['foo'], 'foo.txt', { type: 'text/plain' });
    const data = { files: [testFile] };

    return navigator.canShare(data);
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
