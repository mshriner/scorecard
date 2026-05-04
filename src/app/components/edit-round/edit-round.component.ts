import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatRippleModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AutosizeModule } from 'ngx-autosize';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import {
  APP_ROUTES,
  DELETE_ROUND,
  NAVIGATION_STATE_KEYS,
  SNACKBAR_MESSAGES,
} from '../../models/constants';
import { Course, CourseVariety } from '../../models/course';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  Round,
  ROUND_NOTES_MAX_LENGTH,
  RoundVariety,
  RoundWithCourseDTO,
} from '../../models/round';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';

import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import {
  DataToShare,
  RoundWithCourse,
  YesNoReason,
} from '../../models/data-transfer';
import { ColumnDef } from '../../models/table';
import { RoundVarietyScoresPipe } from '../../pipes/round-variety-scores.pipe';
import { NavigationMessageService } from '../../services/navigation-message.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { DataUtils } from '../../util/data-utils';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';
import { SelectCourseDialogComponent } from '../select-course-dialog/select-course-dialog.component';

@Component({
  selector: 'app-edit-round',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    PipesModule,
    MatSelectModule,
    MatDatepickerModule,
    TypedTemplateDirective,
    MatDialogModule,
    MatRippleModule,
    AutosizeModule,
    NgTemplateOutlet,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-round.component.html',
  styleUrl: './edit-round.component.scss',
})
export class EditRoundComponent implements OnInit {
  appStateService = inject(AppStateService);
  private readonly courseService = inject(CourseService);
  private readonly roundService = inject(RoundService);
  private readonly router = inject(NavigationMessageService);
  private readonly dialog = inject(MatDialog);
  private readonly sharingService = inject(SharingService);
  public readonly snackBarService = inject(SnackBarService);
  private readonly roundVarietyScoresPipe = inject(RoundVarietyScoresPipe);

  private readonly originalRound: Round;
  private readonly redirectToHome: boolean = false;
  public editingRound: Round;
  public coursesToChooseFrom: Course[];
  public currentCourse: Course | null = null;
  public roundIdToEdit: string;
  public imported = false;
  private needToSaveImportedCourse = false;
  public readonly SNACKBAR_MESSAGES = SNACKBAR_MESSAGES;
  public readonly ROUND_NOTES_MAX_LENGTH = ROUND_NOTES_MAX_LENGTH;
  public readonly BACK_NINE = RoundVariety.BACK_NINE;
  public readonly FRONT_NINE = RoundVariety.FRONT_NINE;
  public readonly HOLE_COL = 'hole';
  public readonly STROKES_COL = 'par';
  public readonly PUTTS_COL = 'putts';
  public readonly HOLE_SUMMARY_COL = 'holeSummary';
  public readonly STROKES_SUMMARY_COL = 'parSummary';
  public readonly PUTTS_SUMMARY_COL = 'puttsSummary';
  public readonly ROUND_TABLE_COLUMNS: ColumnDef[] = [
    {
      columnDef: this.HOLE_COL,
      header: 'Hole',
    },
    {
      columnDef: this.STROKES_COL,
      header: 'Strokes',
    },
    {
      columnDef: this.PUTTS_COL,
      header: 'Putts',
    },
  ];
  public readonly ROUND_TABLE_COLUMN_IDS = [
    this.HOLE_COL,
    this.STROKES_COL,
    this.PUTTS_COL,
  ];
  public readonly ROUND_TABLE_SUMMARY_COLUMN_IDS = [
    this.HOLE_SUMMARY_COL,
    this.STROKES_SUMMARY_COL,
    this.PUTTS_SUMMARY_COL,
  ];
  public SCORE_GRAPHIC_TYPES!: {
    score: number;
    scoreToPar: number;
  };
  public HOLE_ROW_TYPES!: {
    holeIndex: number;
    column: ColumnDef;
  };
  public SUMMARY_ROW_TYPES!: {
    outOrIn: RoundVariety;
    columnId: string;
  };
  public readonly EIGHTEEN_HOLE_ROUND_VARIETIES = [
    RoundVariety.EIGHTEEN,
    RoundVariety.FRONT_NINE,
    RoundVariety.BACK_NINE,
  ];
  public readonly NINE_HOLE_ROUND_VARIETIES = [RoundVariety.FULL_NINE];
  public readonly ROUND_VARIETY_ENUM = RoundVariety;
  public readonly showHigherStrokeOptions = signal(false);
  public readonly menuOpen = signal('');

  courseSelectInput: Signal<MatSelect | undefined> = viewChild('courseSelect');

  notesTextarea: Signal<ElementRef<HTMLTextAreaElement> | undefined> =
    viewChild('notesForRoundInput');

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: Event): void {
    if ((event.target as HTMLElement) === this.notesTextarea()?.nativeElement) {
      return;
    }
    if (
      !this.disableSaveButton.result &&
      this.appStateService.unsavedDataOnPage()
    ) {
      this.saveRound();
    }
    event.preventDefault();
  }

  constructor() {
    const datePipe = inject(DatePipe);

    // keep method bound for template callbacks
    this.showSummaryRow = this.showSummaryRow.bind(this);

    this.coursesToChooseFrom = this.courseService.getAllCoursesForCurrentUser();

    const navState = this.router.getCurrentNavigation()?.extras?.state;
    this.roundIdToEdit = navState?.[NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT];

    if (this.roundIdToEdit) {
      const retrieved = this.roundService.getRoundById(this.roundIdToEdit);
      if (!retrieved) {
        this.editingRound = {} as Round;
        this.redirectToHome = true;
        this.originalRound = structuredClone(this.editingRound);
        return;
      }

      this.editingRound = structuredClone(retrieved);
      this.appStateService.setPageTitle(
        `Editing ${datePipe.transform(retrieved.dateStringISO)}`,
      );
      this.updateCurrentCourse(this.editingRound.courseId);
      this.scrollIntoViewIfUnfinished();
      this.originalRound = structuredClone(this.editingRound);
      return;
    }

    // Create new round
    this.editingRound = {
      id: DataUtils.generateUUID('round'),
      strokes: structuredClone(EMPTY_EIGHTEEN_NUMBERS),
      putts: structuredClone(EMPTY_EIGHTEEN_NUMBERS),
      courseId: '',
      dateStringISO: new Date().toISOString(),
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
    };
    this.appStateService.setPageTitle(`Create Round`);
    this.originalRound = structuredClone(this.editingRound);

    if (this.coursesToChooseFrom.length === 1) {
      this.editingRound.courseId = this.coursesToChooseFrom[0].id;
      this.updateCurrentCourse(this.editingRound.courseId);
    }

    setTimeout(() => this.updateUnsavedData());
  }

  ngOnInit(): void {
    if (this.redirectToHome) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    }
  }

  public updateCurrentCourse(newCourseId: string): void {
    this.currentCourse = this.courseService.getCourse(newCourseId);

    if (this.isNineHoleCourse) {
      this.editingRound.roundVariety = RoundVariety.FULL_NINE;
    } else {
      if (this.editingRound.strokes.length === 9) {
        this.editingRound.strokes = this.roundVarietyScoresPipe.transform(
          this.editingRound.strokes,
          RoundVariety.EIGHTEEN,
        );
      }
      if (this.editingRound.putts.length === 9) {
        this.editingRound.putts = this.roundVarietyScoresPipe.transform(
          this.editingRound.putts,
          RoundVariety.EIGHTEEN,
        );
      }
      if (this.editingRound.roundVariety === RoundVariety.FULL_NINE) {
        this.editingRound.roundVariety = RoundVariety.FRONT_NINE;
      }
    }

    this.updateUnsavedData();
  }

  scrollIntoViewIfUnfinished(): void {
    setTimeout(() => {
      const strokes = this.roundVarietyScoresPipe.transform(
        this.editingRound.strokes,
        this.editingRound.roundVariety,
      );
      const index = strokes.findIndex((s) => !s);
      if (index >= 0) {
        document
          .querySelector<HTMLElement>(`[data-hole-index="${index}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  public updateRoundVariety(newRoundVariety: RoundVariety): void {
    this.editingRound.roundVariety = newRoundVariety;
    this.updateUnsavedData();
  }

  public strokesPlusOne(index: number) {
    this.editingRound.strokes[index] ??= 0;
    this.editingRound.strokes[index]++;
    this.updateUnsavedData();
  }

  public strokesMinusOne(index: number) {
    if (
      !this.editingRound.strokes[index] ||
      this.editingRound.strokes[index] === 1
    ) {
      this.editingRound.strokes[index] = null;
    } else {
      this.editingRound.strokes[index]--;
    }
    this.updateUnsavedData();
  }

  public setStrokes(index: number, strokesValue: number | null): void {
    this.editingRound.strokes[index] = strokesValue;
    this.updateUnsavedData();
  }

  public puttsPlusOne(index: number) {
    this.editingRound.putts[index] ??= -1;
    this.editingRound.putts[index]++;
    this.updateUnsavedData();
  }

  public puttsMinusOne(index: number) {
    if (!this.editingRound.putts[index]) {
      this.editingRound.putts[index] = null;
    } else {
      this.editingRound.putts[index]--;
    }
    this.updateUnsavedData();
  }

  public setPutts(index: number, puttsValue: number | null): void {
    this.editingRound.putts[index] = puttsValue;
    this.updateUnsavedData();
  }

  public updateUnsavedData(): void {
    this.appStateService.unsavedDataOnPage.set(
      !DataUtils.deepEqual(this.originalRound, this.editingRound),
    );
  }

  public get isNineHoleCourse(): boolean {
    return this.currentCourse?.numberOfHoles === CourseVariety.NINE;
  }

  public showSummaryRow(index: number): boolean {
    return !this.isNineHoleCourse && (index + 1) % 9 === 0;
  }

  public returnTrue(): boolean {
    return true;
  }

  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.editingRound.dateStringISO = event.value.toISOString();
    }
    this.updateUnsavedData();
  }

  public get disableNumberOfHolesPlayed(): YesNoReason {
    if (!this.editingRound.courseId) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.COURSE_REQUIRED,
      };
    }
    if (this.imported) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.IMPORTED_ROUND,
      };
    }
    if (this.isNineHoleCourse) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.NINE_HOLE_COURSE,
      };
    }
    return {
      result: false,
      reason: '',
    };
  }

  public get disableSaveButton(): YesNoReason {
    if (!this.appStateService.unsavedDataOnPage()) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.NO_CHANGES_TO_SAVE,
      };
    }
    if (!Date.parse(this.editingRound.dateStringISO)) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.DATE_REQUIRED,
      };
    }
    if (!this.editingRound.roundVariety) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.ROUND_VARIETY_REQUIRED,
      };
    }
    if (!this.editingRound.courseId.length) {
      return {
        result: true,
        reason: SNACKBAR_MESSAGES.COURSE_REQUIRED,
      };
    }
    return {
      result: false,
      reason: '',
    };
  }

  public deleteRound(): void {
    this.dialog
      .open(AreYouSureDialogComponent, {
        data: DELETE_ROUND,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.appStateService.currentUser.update((updatedCurrentUser) => {
            if (updatedCurrentUser) {
              updatedCurrentUser.roundIds = updatedCurrentUser.roundIds.filter(
                (roundId) => roundId !== this.roundIdToEdit,
              );
            }
            return structuredClone(updatedCurrentUser);
          });
          this.roundService.deleteRounds([this.roundIdToEdit]);
          this.router.navigateByUrl(APP_ROUTES.HOME);
        }
      });
  }

  public saveRound(): void {
    if (this.currentCourse && this.needToSaveImportedCourse) {
      this.courseService.setCourse(this.currentCourse);
      this.needToSaveImportedCourse = false;
    }
    this.roundService.saveRounds([this.editingRound]);
    this.router.navigateByUrl(APP_ROUTES.HOME);
  }

  public shareRound(): void {
    if (!this.roundIdToEdit || !this.currentCourse) {
      return;
    }
    this.sharingService
      .shareData({
        data: { round: this.editingRound, course: this.currentCourse },
        objectType: 'round',
      })
      .subscribe();
  }

  public async onFileSelected(input: HTMLInputElement): Promise<boolean> {
    const file = input.files?.[0];
    if (!file?.text?.call) {
      input.value = '';
      return false;
    }
    return file.text().then(
      (uploaded) => this.parseImportedFile(input, uploaded),
      (_error) => {
        input.value = '';
        throw new Error(_error);
      },
    );
  }

  private setRoundAndCourse(
    courseName: string,
    importedRound: RoundWithCourse,
  ): void {
    this.editingRound = importedRound.round;
    this.roundIdToEdit = importedRound.round.id;
    this.coursesToChooseFrom = [this.currentCourse!];
    this.updateUnsavedData();
    setTimeout(() => {
      this.courseSelectInput()?.writeValue(this.currentCourse?.id);
    });
    this.snackBarService.openTemporarySnackBar(
      `Round at "${courseName}" was imported successfully.`,
    );
  }

  private async parseImportedFile(
    input: HTMLInputElement,
    uploaded: string,
  ): Promise<boolean> {
    let parsed: DataToShare | null = null;
    try {
      parsed = this.sharingService.convertDTOToDomain(JSON.parse(uploaded));
    } catch (e) {
      console.error(e);
    }
    input.value = '';
    if (
      parsed?.objectType !== 'round' ||
      !(parsed?.data as RoundWithCourse)?.round ||
      !(parsed?.data as RoundWithCourse)?.course
    ) {
      this.snackBarService.openTemporarySnackBar('Failed to import the round.');
      return false;
    }

    const importedRound = parsed.data as RoundWithCourse;
    let dialogOpened = false;

    if (this.doesThisRoundIdExistOnThisDevice(importedRound.round.id)) {
      importedRound.round.id = DataUtils.generateUUID('round');
    }

    if (
      this.doesAnotherUserHaveThisCourseIdOnThisDevice(
        importedRound.round.courseId,
      )
    ) {
      const newCourseId = DataUtils.generateUUID('course');
      importedRound.course.id = newCourseId;
      importedRound.round.courseId = newCourseId;
    }
    this.needToSaveImportedCourse = false;
    this.imported = true;
    this.appStateService.setPageTitle(`Import Round`);
    const existingCourse = this.courseService.getCourse(
      importedRound.round.courseId,
    );
    if (existingCourse) {
      this.currentCourse = existingCourse;
    } else {
      this.currentCourse = importedRound.course;
      this.needToSaveImportedCourse = true;

      // Filter available courses to those that exactly match the imported
      // course's per-hole par (length must match and each hole par equal)
      const availableCourses = this.courseService.getAllCoursesForCurrentUser();

      const matchingCourses = availableCourses.filter((course) => {
        if (!course?.par || !importedRound.course?.par) {
          return false;
        }
        if (course.par.length !== importedRound.course.par.length) {
          return false;
        }
        return course.par.every((p, i) => p === importedRound.course.par[i]);
      });

      if (matchingCourses.length > 0) {
        // Let the user pick from matching courses
        dialogOpened = true;
        const courseDTO = (JSON.parse(uploaded) as RoundWithCourseDTO)
          ?.courseDTO;
        const originalCourseName = courseDTO?.name;
        setTimeout(() => {
          this.dialog
            .open(SelectCourseDialogComponent, {
              data: {
                importedCourse: courseDTO,
                matchingCourses: matchingCourses,
              },
            })
            .afterClosed()
            .subscribe((selectedCourseId: string) => {
              const pickedCourse =
                this.courseService.getCourse(selectedCourseId);
              if (selectedCourseId && pickedCourse) {
                this.currentCourse = pickedCourse;
                this.coursesToChooseFrom = [this.currentCourse];
                importedRound.round.courseId = pickedCourse.id;
                this.needToSaveImportedCourse = false;
                this.updateUnsavedData();
                setTimeout(() => {
                  this.courseSelectInput()?.writeValue(pickedCourse.id);
                });
                this.setRoundAndCourse(pickedCourse?.name, importedRound);
              } else {
                this.setRoundAndCourse(originalCourseName, importedRound);
              }
            });
        });
      }
    }

    if (!dialogOpened) {
      this.setRoundAndCourse(
        this.needToSaveImportedCourse
          ? (JSON.parse(uploaded) as RoundWithCourseDTO)?.courseDTO?.name
          : existingCourse?.name || '',
        importedRound,
      );
    }
    return true;
  }

  private doesAnotherUserHaveThisCourseIdOnThisDevice(
    courseId: string,
  ): boolean {
    return (
      !this.appStateService.currentUser()?.courseIds?.includes(courseId) &&
      !!this.courseService.getCourse(courseId)
    );
  }

  private doesThisRoundIdExistOnThisDevice(roundId: string): boolean {
    return !!this.roundService.getRoundById(roundId);
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }
}
