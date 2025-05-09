import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AutosizeModule } from 'ngx-autosize';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import {
  APP_ROUTES,
  DELETE_ROUND,
  NAVIGATION_STATE_KEYS,
} from '../../models/constants';
import { Course } from '../../models/course';
import {
  ROUND_NOTES_MAX_LENGTH,
  Round,
  RoundVariety,
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
import equal from 'fast-deep-equal';
import { RoundWithCourse } from '../../models/data-transfer';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { DataUtils } from '../../util/data-utils';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';

interface ColumnDef {
  columnDef: string;
  header: string;
}

@Component({
  selector: 'app-edit-round',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    PipesModule,
    MatSelectModule,
    MatDatepickerModule,
    CommonModule,
    TypedTemplateDirective,
    MatDialogModule,
    AutosizeModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-round.component.html',
  styleUrl: './edit-round.component.scss',
})
export class EditRoundComponent implements OnInit {
  private readonly originalRound: Round;
  private readonly redirectToHome: boolean = false;
  public editingRound: Round;
  public coursesToChooseFrom: Course[];
  public currentCourse: Course | null = null;
  public roundIdToEdit: string;
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
  public readonly ROUND_VARIETIES = Object.values(RoundVariety);
  public readonly ROUND_VARIETY_ENUM = RoundVariety;

  constructor(
    public appStateService: AppStateService,
    private readonly courseService: CourseService,
    private readonly roundService: RoundService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly sharingService: SharingService,
    private readonly snackBarService: SnackBarService,
    datePipe: DatePipe,
  ) {
    this.coursesToChooseFrom = this.courseService.getAllCoursesForCurrentUser();
    this.roundIdToEdit =
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT
      ];
    console.log(`id if this is an existing round: ${this.roundIdToEdit}`);
    this.snackBarService.openTemporarySnackBar(
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.MESSAGE
      ],
    );
    if (this.roundIdToEdit) {
      const retrieved = this.roundService.getRoundById(this.roundIdToEdit);
      if (!retrieved) {
        this.editingRound = {} as Round;
        this.redirectToHome = true;
      } else {
        this.editingRound = JSON.parse(JSON.stringify(retrieved));
        this.appStateService.setPageTitle(
          `Editing ${datePipe.transform(retrieved?.dateStringISO)}`,
        );
        this.updateCurrentCourse(this.editingRound.courseId);
      }
    } else {
      this.editingRound = {
        id: DataUtils.generateUUID('round'),
        strokes: new Array(18).fill(0),
        putts: new Array(18).fill(undefined),
        courseId: '',
        dateStringISO: new Date().toISOString(),
        roundVariety: RoundVariety.EIGHTEEN,
        generalNotes: '',
      };
      this.appStateService.setPageTitle(`Create Round`);
    }
    this.originalRound = JSON.parse(JSON.stringify(this.editingRound));
  }

  ngOnInit(): void {
    if (this.redirectToHome) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    }
  }

  public updateCurrentCourse(newCourseId: string): void {
    console.log('selected course', newCourseId);
    this.currentCourse = this.courseService.getCourse(newCourseId);
    this.updateUnsavedData();
  }

  public updateRoundVariety(newRoundVariety: RoundVariety): void {
    console.log('selected round variety', newRoundVariety);
    this.editingRound.roundVariety = newRoundVariety;
    this.updateUnsavedData();
  }

  public strokesPlusOne(index: number) {
    this.editingRound.strokes[index]++;
    this.updateUnsavedData();
  }

  public strokesMinusOne(index: number) {
    if (this.editingRound.strokes[index]) {
      this.editingRound.strokes[index]--;
    }
    this.updateUnsavedData();
  }

  public puttsPlusOne(index: number) {
    this.editingRound.putts[index] ??= 0;
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

  public updateUnsavedData(): void {
    this.appStateService.unsavedDataOnPage.set(
      !equal(this.originalRound, this.editingRound),
    );
  }

  public showSummaryRow(index: number): boolean {
    return (index + 1) % 9 === 0;
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

  public get disableSaveButton(): boolean {
    return (
      !Date.parse(this.editingRound.dateStringISO) ||
      !this.editingRound.roundVariety ||
      !this.editingRound.courseId.length
    );
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
      .subscribe((result) => {
        console.log(result);
      });
  }

  public onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    file?.text().then((uploaded) => {
      const parsed = this.sharingService.convertDTOToDomain(
        JSON.parse(uploaded),
      );
      console.log(`received: ${uploaded}`, `parsed: ${JSON.stringify(parsed)}`);
      if (
        parsed?.objectType === 'round' &&
        parsed.data.round &&
        parsed.data.course
      ) {
        const importedRound = parsed.data as RoundWithCourse;
        if (
          !this.appStateService
            .currentUser()
            ?.courseIds?.includes(importedRound.round.courseId) &&
          this.courseService.getCourse(importedRound.round.courseId)
        ) {
          const newCourseId = DataUtils.generateUUID('course');
          importedRound.course.id = newCourseId;
          importedRound.round.courseId = newCourseId;
        }
        if (!this.courseService.getCourse(importedRound.round.courseId)) {
          this.courseService.setCourse(importedRound.course);
        }
        this.roundService.saveRounds([importedRound.round]);
        this.router.navigateByUrl(APP_ROUTES.HOME).then(() => {
          this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND, {
            state: {
              [NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT]: importedRound.round.id,
              [NAVIGATION_STATE_KEYS.MESSAGE]: `Round at "${this.courseService.getCourse(importedRound.course.id)?.name}" was imported successfully.`,
            },
          });
        });
      } else {
        this.snackBarService.openTemporarySnackBar(
          'Failed to import the round.',
        );
      }
    });
  }
}
