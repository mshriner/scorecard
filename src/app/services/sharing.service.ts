import { DatePipe } from '@angular/common';
import { inject, Service } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, from, map, Observable, of } from 'rxjs';
import { PreformattedDialogComponent } from '../components/preformatted-dialog/preformatted-dialog.component';
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
  UserWithRoundsAndCourses,
} from '../models/data-transfer';
import {
  Round,
  ROUND_EXAMPLE,
  ROUND_NOTES_MAX_LENGTH,
  RoundDTO,
  RoundWithCourseDTO,
} from '../models/round';
import { User, UserProfileDTO } from '../models/user';
import { DataUtils } from '../util/data-utils';
import { SnackBarService } from './snack-bar.service';

@Service()
export class SharingService {
  public readonly CAN_SHARE_DATA = this.canBrowserShareData('test');
  public readonly CAN_SHARE_FILES = this.canBrowserShareFiles();
  private readonly DATE_PIPE = new DatePipe('en-US');
  private readonly IMPORTED_MESSAGE = ' (imported)';

  private readonly dialog = inject(MatDialog);
  private readonly snackBarService = inject(SnackBarService);

  private canBrowserShareData(data: any): boolean {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }

    return navigator.canShare({ text: JSON.stringify(data) });
  }

  public shareData(dataToShare: DataToShare): Observable<boolean> {
    if (!this.CAN_SHARE_DATA || !this.CAN_SHARE_FILES) {
      this.snackBarService.openTemporarySnackBar(
        'Your browser does not support sharing at this time.',
      );
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
      console.log(`Sharing ${shareFileName}`);
      return from(navigator.share(toShare)).pipe(
        map(() => true),
        catchError((e) => {
          // The data could not be or was not shared.
          if (e.name === 'AbortError') {
            this.snackBarService.openTemporarySnackBar('Sharing was cancelled');
          } else {
            console.error(e);
            this.dialog
              .open(PreformattedDialogComponent, {
                data: {
                  dialogTitle: 'Copy Data',
                  fileTitle: shareFileName,
                  content: JSON.stringify(exportedItem),
                },
              })
              .afterClosed()
              .subscribe();
          }
          return of(false);
        }),
      );
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
      case 'user': {
        const exportedUserName = (
          dataToShare.data as UserWithRoundsAndCourses
        )?.user?.name
          ?.trim()
          ?.replace(/\s+/g, '-');
        return `user-${exportedUserName}`;
      }
      default:
        return 'unknown';
    }
  }

  convertDomainToDTO(
    dataToShare: DataToShare,
  ): CourseDTO | RoundWithCourseDTO | UserProfileDTO | null {
    switch (dataToShare.objectType) {
      case 'course': {
        const metadataDTO: ExportedItem = {
          objectType: dataToShare.objectType,
        };
        return { ...dataToShare.data, ...metadataDTO } as CourseDTO;
      }
      case 'round': {
        const roundAndCourseData = dataToShare.data as RoundWithCourse;
        const metadataDTO: ExportedItem = {
          objectType: dataToShare.objectType,
        };
        return {
          ...roundAndCourseData.round,
          courseDTO: roundAndCourseData.course,
          ...metadataDTO,
        } as RoundWithCourseDTO;
      }
      case 'user': {
        const userProfile = dataToShare.data as UserWithRoundsAndCourses;
        const metadataDTO: ExportedItem = {
          objectType: dataToShare.objectType,
        };
        return {
          userDTO: {
            name: userProfile.user.name,
            id: userProfile.user.id,
            appFontScaling: userProfile.user.appFontScaling,
          },
          roundDTOs:
            userProfile.rounds?.map((round) => ({
              objectType: 'round',
              ...round,
            })) || [],
          courseDTOs:
            userProfile.courses?.map((course) => ({
              objectType: 'course',
              ...course,
            })) || [],
          ...metadataDTO,
        } as UserProfileDTO;
      }
      default:
        return null;
    }
  }

  public convertDTOToDomain(
    importedItem: CourseDTO | RoundWithCourseDTO | UserProfileDTO,
  ): DataToShare | null {
    try {
      const objectType = (importedItem as any).objectType;

      if (!objectType) {
        console.error('Missing objectType in imported item');
        return null;
      }

      switch (objectType) {
        case 'course': {
          const importedCourse = this.parseCourse(importedItem as CourseDTO);
          if (!importedCourse) {
            return null;
          }
          return { data: importedCourse, objectType };
        }
        case 'round': {
          const importedRound = this.parseRoundWithCourse(
            importedItem as RoundWithCourseDTO,
          );

          if (!importedRound?.course || !importedRound?.round) {
            return null;
          }

          importedRound.round.id = DataUtils.generateUUID(objectType);
          return {
            data: importedRound,
            objectType,
          };
        }
        case 'user': {
          const userProfileDTO = importedItem as UserProfileDTO;
          if (!userProfileDTO.userDTO) {
            console.error('Missing userDTO in imported user item');
            return null;
          }
          const user = this.parseUser(userProfileDTO);
          if (!user) {
            console.error('Failed to parse user');
            return null;
          }
          const parsedRounds =
            userProfileDTO.roundDTOs?.map((round) =>
              this.parseRound(round, false),
            ) ?? [];
          if (parsedRounds.some((parsedRound) => !parsedRound)) {
            console.error('Failed to parse rounds within user');
            return null;
          }
          const parsedCourses =
            userProfileDTO.courseDTOs?.map((course) =>
              this.parseCourse(course, false),
            ) ?? [];
          return {
            data: {
              user,
              courses: parsedCourses as Course[],
              rounds: parsedRounds as Round[],
            },
            objectType,
          };
        }
        default:
          return null;
      }
    } catch (e) {
      console.error(`Error: ${e}`);
      return null;
    }
  }

  private parseRoundWithCourse(
    roundDTO: RoundWithCourseDTO,
  ): RoundWithCourse | null {
    const importedRound = this.parseRound(roundDTO);
    if (!importedRound) {
      return null;
    }
    const importedCourse = this.parseCourse(roundDTO.courseDTO);
    if (!importedCourse) {
      return null;
    }
    return {
      round: importedRound,
      course: importedCourse,
    };
  }

  private parseRound(
    roundDTO: RoundDTO,
    addImportedMessage = true,
  ): Round | null {
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
    if (
      (importedRound?.generalNotes?.length || 0) <
      ROUND_NOTES_MAX_LENGTH - this.IMPORTED_MESSAGE.length
    ) {
      importedRound.generalNotes =
        `${importedRound.generalNotes || ''}${addImportedMessage ? this.IMPORTED_MESSAGE : ''}`.trim();
    }
    return importedRound;
  }

  private parseCourse(
    courseDTO: CourseDTO,
    addImportedMessage = true,
  ): Course | null {
    const importedCourse = {} as Course;
    let valid = true;
    if (
      (courseDTO?.par?.length !== 18 && courseDTO?.par?.length !== 9) ||
      courseDTO?.par.some((p) => p < 1)
    ) {
      return null;
    }
    if (
      courseDTO?.numberOfHoles !== CourseVariety.NINE &&
      courseDTO?.numberOfHoles !== CourseVariety.EIGHTEEN
    ) {
      courseDTO.numberOfHoles =
        courseDTO?.par?.length === 9
          ? CourseVariety.NINE
          : CourseVariety.EIGHTEEN;
    }
    Object.keys(COURSE_EXAMPLE).forEach((key) => {
      if (courseDTO[key] !== undefined) {
        importedCourse[key] = courseDTO[key];
      } else {
        valid = false;
      }
    });
    if (!valid) {
      return null;
    }
    importedCourse.name = `${importedCourse.name}${addImportedMessage ? this.IMPORTED_MESSAGE : ''}`;
    return importedCourse;
  }

  private parseUser(userProfileDTO: UserProfileDTO): User | null {
    if (!userProfileDTO?.userDTO?.name || !userProfileDTO?.userDTO?.id) {
      return null;
    }
    const importedUser = {
      name: userProfileDTO.userDTO.name,
      id: userProfileDTO.userDTO.id,
      appFontScaling: Number(userProfileDTO.userDTO?.appFontScaling) || 1,
      roundIds: Array.isArray(userProfileDTO?.roundDTOs)
        ? userProfileDTO.roundDTOs.map((round) => round.id)
        : [],
      courseIds: Array.isArray(userProfileDTO?.courseDTOs)
        ? userProfileDTO.courseDTOs.map((course) => course.id)
        : [],
    } as User;
    return importedUser;
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
