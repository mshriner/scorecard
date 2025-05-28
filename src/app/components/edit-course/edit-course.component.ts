import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  APP_ROUTES,
  DELETE_COURSE,
  NAVIGATION_STATE_KEYS,
} from '../../models/constants';
import { Course, EIGHTEEN_NUMBERS_ZEROED } from '../../models/course';
import { RoundVariety } from '../../models/round';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { DataUtils } from '../../util/data-utils';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';

@Component({
  selector: 'app-edit-course',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    CommonModule,
    PipesModule,
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.scss',
})
export class EditCourseComponent implements OnInit {
  private readonly originalCourse: Course;
  private readonly redirectToHome: boolean = false;
  public editingCourse: Course;
  public courseIdToEdit: string;
  public readonly BACK_NINE = RoundVariety.BACK_NINE;
  public readonly FRONT_NINE = RoundVariety.FRONT_NINE;
  public readonly HOLE_COL = 'hole';
  public readonly PAR_COL = 'par';
  public readonly HOLE_SUMMARY_COL = 'holeSummary';
  public readonly PAR_SUMMARY_COL = 'parSummary';
  public readonly COURSE_TABLE_COLUMNS = [
    {
      columnDef: this.HOLE_COL,
      header: 'Hole',
    },
    {
      columnDef: this.PAR_COL,
      header: 'Par',
    },
  ];
  public readonly COURSE_TABLE_COLUMN_IDS = this.COURSE_TABLE_COLUMNS.map(
    (def) => def.columnDef,
  );
  public readonly COURSE_TABLE_SUMMARY_COLUMN_IDS = [
    this.HOLE_SUMMARY_COL,
    this.PAR_SUMMARY_COL,
  ];

  constructor(
    public appStateService: AppStateService,
    private readonly courseService: CourseService,
    private readonly dialog: MatDialog,
    private readonly roundService: RoundService,
    private readonly router: Router,
    private readonly sharingService: SharingService,
    private readonly snackBarService: SnackBarService,
  ) {
    this.courseIdToEdit =
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT
      ];
    console.log(`id if this is an existing course: ${this.courseIdToEdit}`);
    this.snackBarService.openTemporarySnackBar(
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.MESSAGE
      ],
    );
    if (this.courseIdToEdit) {
      const retrieved = this.courseService.getCourse(this.courseIdToEdit);
      if (!retrieved) {
        this.editingCourse = {} as Course;
        this.redirectToHome = true;
      } else {
        this.editingCourse = JSON.parse(JSON.stringify(retrieved));
        this.appStateService.setPageTitle(`Editing ${retrieved?.name}`);
      }
    } else {
      this.editingCourse = {
        id: DataUtils.generateUUID('course'),
        par: structuredClone(EIGHTEEN_NUMBERS_ZEROED).fill(4),
        name: '',
      };
      this.appStateService.setPageTitle(`Create Course`);
    }
    this.originalCourse = JSON.parse(JSON.stringify(this.editingCourse));
  }

  ngOnInit(): void {
    if (this.redirectToHome) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    }
  }

  public parPlusOne(index: number) {
    this.editingCourse.par[index]++;
    this.updateUnsavedData();
  }

  public parMinusOne(index: number) {
    if (this.editingCourse.par[index]) {
      this.editingCourse.par[index]--;
    }
    this.updateUnsavedData();
  }

  public showSummaryRow(index: number): boolean {
    return (index + 1) % 9 === 0;
  }

  public returnTrue(): boolean {
    return true;
  }

  public updateUnsavedData(): void {
    this.appStateService.unsavedDataOnPage.set(
      !DataUtils.deepEqual(this.originalCourse, this.editingCourse),
    );
  }

  public get disableSaveButton(): boolean {
    return (
      !this.editingCourse.name.length ||
      this.editingCourse.par.some((hole) => (hole || 0) <= 0)
    );
  }

  public deleteCourse(): void {
    this.dialog
      .open(AreYouSureDialogComponent, {
        data: DELETE_COURSE,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.appStateService.currentUser.update((updatedCurrentUser) => {
            if (updatedCurrentUser) {
              if (updatedCurrentUser?.roundIds?.length) {
                const roundIdsToRemove: Set<string> = new Set(
                  this.roundService
                    .getRoundsByIds(updatedCurrentUser.roundIds)
                    .filter((round) => round.courseId === this.courseIdToEdit)
                    .map((round) => round.id),
                );
                updatedCurrentUser.roundIds =
                  updatedCurrentUser.roundIds.filter(
                    (roundId) => !roundIdsToRemove.has(roundId),
                  );
                this.roundService.deleteRounds([...roundIdsToRemove]);
                updatedCurrentUser.courseStatsFilterSelect =
                  updatedCurrentUser.courseStatsFilterSelect?.filter(
                    (courseId) => courseId !== this.courseIdToEdit,
                  ) || [];
              }
              updatedCurrentUser.courseIds =
                updatedCurrentUser.courseIds?.filter(
                  (courseId) => courseId !== this.courseIdToEdit,
                ) || [];
            }
            return structuredClone(updatedCurrentUser);
          });
          this.courseService.deleteCourses([this.courseIdToEdit]);
          this.router.navigateByUrl(APP_ROUTES.COURSES, {
            state: {
              [NAVIGATION_STATE_KEYS.MESSAGE]: `Deleted course "${
                this.editingCourse.name
              }"`,
            },
          });
        }
      });
  }

  public shareCourse(): void {
    if (!this.courseIdToEdit) {
      return;
    }
    this.sharingService
      .shareData({ data: this.editingCourse, objectType: 'course' })
      .subscribe((result) => {
        console.log(result);
      });
  }

  public saveCourse(): void {
    this.courseService.setCourse(this.editingCourse);
    this.router.navigateByUrl(APP_ROUTES.COURSES, {
      state: {
        [NAVIGATION_STATE_KEYS.MESSAGE]: `Saved course "${
          this.editingCourse.name
        }"`,
      },
    });
  }

  public onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    file?.text().then((uploaded) => {
      const parsed = this.sharingService.convertDTOToDomain(
        JSON.parse(uploaded),
      );
      console.log(`received: ${uploaded}`, `parsed: ${JSON.stringify(parsed)}`);
      if (parsed?.objectType === 'course') {
        const importedCourse = parsed.data as Course;
        importedCourse.id = DataUtils.generateUUID('course');
        this.courseService.setCourse(importedCourse);
        this.router.navigateByUrl(APP_ROUTES.COURSES).then(() => {
          this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE, {
            state: {
              [NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT]: importedCourse.id,
              [NAVIGATION_STATE_KEYS.MESSAGE]: `Course "${importedCourse.name}" was imported successfully.`,
            },
          });
        });
      } else {
        this.snackBarService.openTemporarySnackBar(
          'Failed to import the course.',
        );
      }
    });
  }
}
