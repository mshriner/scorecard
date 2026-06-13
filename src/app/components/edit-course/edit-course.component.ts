import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import {
  APP_ROUTES,
  DELETE_COURSE,
  NAVIGATION_STATE_KEYS,
  SNACKBAR_MESSAGES,
} from '../../models/constants';
import {
  Course,
  CourseVariety,
  EIGHTEEN_NUMBERS_ZEROED,
} from '../../models/course';
import { DataToShare, YesNoReason } from '../../models/data-transfer';
import { ArrayOfHolesInner } from '../../models/generated/model/arrayOfHolesInner';
import { Course as ApiCourse } from '../../models/generated/model/course';
import { TeeBox } from '../../models/generated/model/teeBox';
import {
  compareRoundsByDateDescending,
  RoundVariety,
} from '../../models/round';
import { EighteenNumbers, NineNumbers } from '../../models/storage-object';
import { GenderForScoring } from '../../models/user';
import { CourseVarietySlicePipe } from '../../pipes/course-variety-slice.pipe';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { GolfCourseApiService } from '../../services/golf-course-api.service';
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
    MatStepperModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    PipesModule,
    NgTemplateOutlet,
    TitleCasePipe,
    MatDivider,
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
  public readonly snackBarService = inject(SnackBarService);
  private readonly courseVarietySlicePipe = inject(CourseVarietySlicePipe);
  private readonly golfCourseApiService = inject(GolfCourseApiService);

  stepper = viewChild(MatStepper);
  searchQueryInput: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild('searchQueryInput');
  private readonly originalCourse: Course;
  private readonly redirectToHome: boolean = false;
  public editingCourse: Course;
  public courseIdToEdit: string;
  public imported = false;
  public mode = signal<'initial-choice' | 'search' | 'edit'>('initial-choice');
  public showStepper = signal(false);
  public searchQuery = signal('');
  private readonly sanitizedSearchQuery = computed(() =>
    this.searchQuery().trim().replaceAll(/\s+/g, '+'),
  );
  public searchResults = signal<ApiCourse[]>([]);
  public selectedCourseFromSearch = signal<ApiCourse | null>(null);
  public selectedGender = signal<GenderForScoring | null>(null);
  public selectedTee = signal<TeeBox | null>(null);
  public isOnline = signal(navigator.onLine);
  public searchingForCourses = signal(false);
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

  private readonly NO_INTERNET =
    'No internet connection. Unable to search for courses.';

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: Event): void {
    if (
      this.mode() === 'search' &&
      (event.target as HTMLElement) === this.searchQueryInput()?.nativeElement
    ) {
      this.searchCourses();
    } else if (
      this.mode() === 'edit' &&
      !this.disableSaveAndShareButtons.result &&
      this.appStateService.unsavedDataOnPage()
    ) {
      this.saveCourse();
    }
    event.preventDefault();
  }

  constructor() {
    effect(() => {
      if (this.mode() === 'initial-choice' && !this.isOnline()) {
        this.mode.set('edit');
        this.snackBarService.openTemporarySnackBar(this.NO_INTERNET);
      }
      if (this.mode() === 'edit' && this.courseIdToEdit) {
        this.appStateService.setPageTitle(
          `Edit Course: ${this.editingCourse.name}`,
        );
      } else if (
        this.mode() === 'initial-choice' ||
        (this.mode() === 'edit' && !this.courseIdToEdit)
      ) {
        this.appStateService.setPageTitle(`Create Course`);
      } else if (this.mode() === 'search') {
        this.appStateService.setPageTitle(`Search Courses`);
      }
    });

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
        this.mode.set('edit');
      }
    } else {
      this.editingCourse = {
        id: DataUtils.generateUUID('course'),
        numberOfHoles: CourseVariety.EIGHTEEN,
        par: structuredClone(EIGHTEEN_NUMBERS_ZEROED).fill(4),
        name: '',
      };
      this.mode.set('initial-choice');
    }
    this.originalCourse = structuredClone(this.editingCourse);
  }

  ngOnInit(): void {
    if (this.redirectToHome) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    }
    this.selectedGender.set(
      this.appStateService.currentUser()?.scoringGender || null,
    );
    this.isOnline.set(navigator.onLine);
    globalThis.addEventListener('online', () => this.isOnline.set(true));
    globalThis.addEventListener('offline', () => this.isOnline.set(false));
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

  public get disableSaveAndShareButtons(): YesNoReason {
    if (!this.editingCourse.name.length) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.COURSE_NAME_INVALID,
      };
    }
    if (this.editingCourse.par.some((hole) => (hole || 0) <= 0)) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.COURSE_MISSING_PAR,
      };
    }
    return {
      result: false,
      reason: '',
    };
  }

  public get disableSaveCourseButton(): YesNoReason {
    const disableSaveAndShareButtons = this.disableSaveAndShareButtons;
    if (disableSaveAndShareButtons.result) {
      return disableSaveAndShareButtons;
    }
    if (!this.appStateService.unsavedDataOnPage()) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.NO_CHANGES_TO_SAVE,
      };
    }
    return {
      result: false,
      reason: '',
    };
  }

  public searchCourses(): void {
    if (!this.sanitizedSearchQuery()) {
      return;
    }
    if (!this.isOnline()) {
      this.snackBarService.openTemporarySnackBar(this.NO_INTERNET);
      this.mode.set('edit');
      return;
    }
    this.searchingForCourses.set(true);
    this.golfCourseApiService
      .searchCourses(this.sanitizedSearchQuery())
      .subscribe({
        next: (result) => {
          this.searchingForCourses.set(false);

          // Filter out courses that don't have 9 or 18 holes
          const validCourses = (result.courses || []).filter(
            (course: ApiCourse) => {
              const tees = course.tees;
              if (!tees) {
                return false;
              }

              // Check if any tee set has 9 or 18 holes
              return Object.values(tees).some((genderTees: TeeBox[]) =>
                genderTees?.some(
                  (tee: TeeBox) =>
                    tee.number_of_holes === 9 || tee.number_of_holes === 18,
                ),
              );
            },
          );

          this.searchResults.set(validCourses);
          if (this.searchResults().length === 0) {
            this.snackBarService.openTemporarySnackBar(
              'No courses found for that search.',
            );
          } else {
            // Progress to course selection step
            this.stepper()?.next();
          }
        },
        error: (err) => {
          this.searchingForCourses.set(false);
          console.error('Search error:', err);
          this.snackBarService.openTemporarySnackBar(
            'Error searching for courses. Please check your internet connection.',
          );
        },
      });
  }

  public finalizeCourse(): void {
    if (
      !this.selectedCourseFromSearch() ||
      !this.selectedTee() ||
      !this.selectedGender()
    ) {
      return;
    }

    this.appStateService.currentUser.update((user) => {
      if (user) {
        user.scoringGender = this.selectedGender()!;
      }
      return structuredClone(user);
    });

    const course = this.selectedCourseFromSearch()!;
    const tee = this.selectedTee()!;
    this.editingCourse.name = `${course.club_name || 'Unknown Club'}${course.course_name !== course.club_name ? '- ' + (course.course_name || 'Unknown Course') : ''}`;
    this.editingCourse.numberOfHoles =
      tee.number_of_holes === 18 ? CourseVariety.EIGHTEEN : CourseVariety.NINE;

    const parValues = tee.holes!.map((h: ArrayOfHolesInner) => h.par ?? 4);
    if (tee.number_of_holes === 18) {
      this.editingCourse.par = parValues as EighteenNumbers;
    } else {
      this.editingCourse.par = parValues as NineNumbers;
    }
    this.updateUnsavedData();
    this.mode.set('edit');
    this.showStepper.set(false);
  }

  public onStepperSelectionChange(event: any): void {
    if (event.selectedIndex === 4) {
      this.finalizeCourse();
    }
  }

  public closeStepper(): void {
    this.showStepper.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedCourseFromSearch.set(null);
    this.selectedTee.set(null);
  }

  public startSearch(): void {
    this.mode.set('search');
    this.showStepper.set(true);
  }

  public enterManual(): void {
    this.mode.set('edit');
  }

  public updateCourseNumberOfHoles(): void {
    console.log('selected course length', this.editingCourse.numberOfHoles);
    this.editingCourse.par = this.courseVarietySlicePipe.transform(
      this.editingCourse.par,
      this.editingCourse.numberOfHoles ?? CourseVariety.EIGHTEEN,
    );
  }

  public setUserScoringGender(gender: GenderForScoring): void {
    this.selectedGender.set(gender);
  }

  public deleteCourse(): void {
    // Check if there are any rounds associated with this course
    const roundsToDelete = this.roundService
      .getRoundsByIds(this.appStateService.currentUser()?.roundIds || [])
      .filter((round) => round.courseId === this.courseIdToEdit)
      .sort(compareRoundsByDateDescending);

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
