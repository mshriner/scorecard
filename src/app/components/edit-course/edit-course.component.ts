import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {
  APP_ROUTES,
  DELETE_COURSE,
  NAVIGATION_STATE_KEYS,
} from '../../models/constants';
import {
  Course,
  CourseVariety,
  EIGHTEEN_NUMBERS_ZEROED,
} from '../../models/course';
import { DataToShare } from '../../models/data-transfer';
import { compareRoundsByDate, RoundVariety } from '../../models/round';
import { CourseVarietySlicePipe } from '../../pipes/course-variety-slice.pipe';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { NavigationMessageService } from '../../services/navigation-message.service';
import { RoundService } from '../../services/round.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { DataUtils } from '../../util/data-utils';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';
import { DeleteCourseDialogComponent } from '../delete-course-dialog/delete-course-dialog.component';

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
    MatSelectModule,
    MatCardModule,
    CommonModule,
    PipesModule,
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.scss',
})
export class EditCourseComponent implements OnInit {
  appStateService = inject(AppStateService);
  private readonly courseService = inject(CourseService);
  private readonly dialog = inject(MatDialog);
  private readonly roundService = inject(RoundService);
  private readonly router = inject(NavigationMessageService);
  private readonly sharingService = inject(SharingService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly courseVarietySlicePipe = inject(CourseVarietySlicePipe);

  private readonly originalCourse: Course;
  private readonly redirectToHome: boolean = false;
  public editingCourse: Course;
  public courseIdToEdit: string;
  public imported = false;
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
  public readonly COURSE_VARIETIES = Object.values(CourseVariety);

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    if (!this.disableSaveButton && this.appStateService.unsavedDataOnPage()) {
      this.saveCourse();
    }
    event.preventDefault();
  }

  constructor() {
    this.showSummaryRow = this.showSummaryRow.bind(this);
    const navState = this.router.getCurrentNavigation()?.extras?.state;
    this.courseIdToEdit = navState?.[NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT];
    console.log(`id if this is an existing course: ${this.courseIdToEdit}`);
    if (this.courseIdToEdit) {
      const retrieved = this.courseService.getCourse(this.courseIdToEdit);
      if (!retrieved) {
        this.editingCourse = {
          name: '',
          par: EIGHTEEN_NUMBERS_ZEROED,
          id: '-1',
        };
        this.redirectToHome = true;
      } else {
        this.editingCourse = structuredClone(retrieved);
        if (!this.editingCourse.numberOfHoles) {
          this.editingCourse.numberOfHoles =
            this.editingCourse.par.length === 9
              ? CourseVariety.NINE
              : CourseVariety.EIGHTEEN;
        }
        this.appStateService.setPageTitle(`Editing ${retrieved?.name}`);
      }
    } else {
      this.editingCourse = {
        id: DataUtils.generateUUID('course'),
        numberOfHoles: CourseVariety.EIGHTEEN,
        par: structuredClone(EIGHTEEN_NUMBERS_ZEROED).fill(4),
        name: '',
      };
      this.appStateService.setPageTitle(`Create Course`);
    }
    this.originalCourse = structuredClone(this.editingCourse);
  }

  ngOnInit(): void {
    if (this.redirectToHome) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    }
  }

  public isShareDisabled(): boolean {
    return this.editingCourse?.par.some((p) => p < 1);
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
    return (
      this.editingCourse?.numberOfHoles === CourseVariety.EIGHTEEN &&
      (index + 1) % 9 === 0
    );
  }

  public returnTrue(): boolean {
    return true;
  }

  public get parToShow(): RoundVariety {
    return this.editingCourse?.numberOfHoles === CourseVariety.NINE
      ? RoundVariety.FULL_NINE
      : RoundVariety.EIGHTEEN;
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

  public updateCourseNumberOfHoles(): void {
    console.log('selected course length', this.editingCourse.numberOfHoles);
    this.editingCourse.par = this.courseVarietySlicePipe.transform(
      this.editingCourse.par,
      this.editingCourse.numberOfHoles ?? CourseVariety.EIGHTEEN,
    );
  }

  public deleteCourse(): void {
    // Check if there are any rounds associated with this course
    const roundsToDelete = this.roundService
      .getRoundsByIds(this.appStateService.currentUser()?.roundIds || [])
      .filter((round) => round.courseId === this.courseIdToEdit)
      .sort(compareRoundsByDate);

    if (roundsToDelete.length > 0) {
      // Show confirmation dialog with rounds that will be deleted
      this.dialog
        .open(DeleteCourseDialogComponent, {
          data: {
            course: this.editingCourse,
            roundsToDelete: roundsToDelete,
          },
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.performDelete(roundsToDelete.map((r) => r.id));
          }
        });
    } else {
      // Show regular confirmation if no rounds will be deleted
      this.dialog
        .open(AreYouSureDialogComponent, {
          data: DELETE_COURSE,
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.performDelete([]);
          }
        });
    }
  }

  private performDelete(roundIdsToRemove: string[]): void {
    this.appStateService.currentUser.update((updatedCurrentUser) => {
      if (updatedCurrentUser) {
        if (roundIdsToRemove.length > 0) {
          updatedCurrentUser.roundIds =
            updatedCurrentUser.roundIds?.filter(
              (roundId) => !roundIdsToRemove.includes(roundId),
            ) || [];
          this.roundService.deleteRounds(roundIdsToRemove);
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
    this.router.navigateByUrl(
      APP_ROUTES.COURSES,
      {},
      `Deleted course "${this.editingCourse.name}"`,
    );
  }

  public shareCourse(): void {
    if (!this.courseIdToEdit) {
      return;
    }
    this.sharingService
      .shareData({ data: this.editingCourse, objectType: 'course' })
      .subscribe();
  }

  public saveCourse(): void {
    this.updateCourseNumberOfHoles();
    this.courseService.setCourse(this.editingCourse);
    this.router.navigateByUrl(
      APP_ROUTES.COURSES,
      {},
      `Saved course "${this.editingCourse.name}"`,
    );
  }

  public async onFileSelected(input: HTMLInputElement): Promise<boolean> {
    const file = input.files?.[0];
    if (!file?.text?.call) {
      input.value = '';
      return false;
    }
    return file.text().then(
      (uploaded) => {
        let parsed: DataToShare | null = null;
        try {
          parsed = this.sharingService.convertDTOToDomain(JSON.parse(uploaded));
        } catch (e) {
          console.error(e);
        }
        input.value = '';
        if (parsed?.objectType === 'course') {
          const importedCourse = parsed.data as Course;
          importedCourse.id = DataUtils.generateUUID('course');
          this.editingCourse = importedCourse;
          this.imported = true;
          this.appStateService.setPageTitle(`Import Course`);
          this.updateUnsavedData();
          this.snackBarService.openTemporarySnackBar(
            `Course "${importedCourse.name}" was imported successfully.`,
          );
          return true;
        } else {
          this.snackBarService.openTemporarySnackBar(
            'Failed to import the course.',
          );
          return false;
        }
      },
      (error_) => {
        input.value = '';
        throw new Error(error_);
      },
    );
  }
}
