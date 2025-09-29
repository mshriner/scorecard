import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatOption,
  MatRippleModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course, CourseVariety } from '../../models/course';
import {
  createEmptyHoleResults,
  HoleResults,
  PerformanceGraphData,
  PerformanceGraphDataPoint,
  PerformanceGraphMetric,
} from '../../models/graph';
import {
  BestRound,
  EMPTY_EIGHTEEN_NUMBERS,
  EMPTY_NINE_NUMBERS,
  FullRoundVarietyAtCourse,
  Round,
  RoundVariety,
} from '../../models/round';
import {
  LocalUserWithFilters,
  ResultsSorting,
  ROUND_DATE_SORT_COL,
  ROUND_SCORE_SORT_COL,
} from '../../models/user';
import { PipesModule } from '../../pipes/pipes.module';
import { TotalRoundScorePipe } from '../../pipes/total-round-score.pipe';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { DataUtils } from '../../util/data-utils';
import { BestRoundDialogComponent } from '../best-round-dialog/best-round-dialog.component';
import { PerformanceGraphDialogComponent } from '../performance-graph-dialog/performance-graph-dialog.component';

@Component({
  selector: 'app-home',
  imports: [
    MatTableModule,
    MatIconModule,
    PipesModule,
    MatDatepickerModule,
    MatButtonModule,
    MatRippleModule,
    MatTabsModule,
    MatCardModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    CommonModule,
    MatDividerModule,
    MatDialogModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('courseStatsFilterSelect') select!: MatSelect;

  readonly dialog = inject(MatDialog);

  public readonly Array = Array;
  public readonly FullRoundVarietyAtCourse = FullRoundVarietyAtCourse;
  public readonly CourseVariety = CourseVariety;
  public rounds: WritableSignal<Round[]> = signal([]);
  public filteredRounds: WritableSignal<Round[]> = signal([]);
  public courseMap: Signal<Map<string, Course | null>> = computed(() => {
    const map: Map<string, Course | null> = new Map();
    this.rounds().forEach((round) => {
      if (!map.has(round.courseId)) {
        const course = this.courseService.getCourse(round.courseId);
        map.set(round.courseId, course);
      }
    });
    return map;
  });
  public holeResultTotals: Signal<HoleResults> = computed(() => {
    const holeResults: HoleResults = createEmptyHoleResults();
    if (!this.filteredRounds()?.length) {
      return holeResults;
    }
    this.filteredRounds().forEach((round) => {
      const course = this.courseMap().get(round.courseId);
      if (!course) {
        return;
      }
      for (let index = 0; index < round.strokes.length; index++) {
        this.processHoleResult(holeResults, round, course, index);
      }
    });
    return holeResults;
  });
  public coursesWithHoleResults: Signal<string[]> = computed(() => {
    return Array.from(this.holeResultTotals().theoreticalBestRound.keys()).sort(
      (a, b) => a.localeCompare(b),
    );
  });

  private processHoleResult(
    holeResults: HoleResults,
    round: Round,
    course: Course,
    index: number,
  ): void {
    const strokes = round.strokes[index];
    if (!strokes) {
      return;
    }

    this.updateTheoreticalBestRound(
      holeResults,
      course,
      index,
      strokes,
      round.dateStringISO,
    );

    holeResults.holesPlayed++;
    const parOnHole = course?.par[index] ?? 0;
    const holeResultToPar = strokes - parOnHole;

    this.updateHoleResultTotals(holeResults, holeResultToPar);

    this.updateParStats(holeResults, parOnHole, strokes);

    if (round.putts[index] || round.putts[index] === 0) {
      holeResults.holesPlayedWithPutts++;
      const putts = round.putts[index];
      holeResults.putts += putts;
      if (strokes - putts <= parOnHole - 2) {
        holeResults.inferredGreensInRegulation++;
      } else {
        holeResults.inferredHolesScramblingNeeded++;
        if (strokes <= parOnHole) {
          holeResults.inferredHolesScramblingSuccessfully++;
        }
      }
      if (round.roundVariety === RoundVariety.EIGHTEEN) {
        holeResults.holesPlayedWithPuttsInFullRounds++;
        holeResults.puttsInFullRounds += putts;
      }
    }
  }

  private updateTheoreticalBestRound(
    holeResults: HoleResults,
    course: Course,
    index: number,
    strokes: number,
    dateStringISO: string,
  ): void {
    if (!holeResults.theoreticalBestRound.has(course.id)) {
      switch (course.numberOfHoles) {
        case CourseVariety.NINE: {
          holeResults.theoreticalBestRound.set(course.id, {
            roundVariety: RoundVariety.FULL_NINE,
            strokes: [...EMPTY_NINE_NUMBERS],
            course: course,
            bestScoresRecordedDateISO: Array<string>(9),
          });
          break;
        }
        case CourseVariety.EIGHTEEN:
        default: {
          holeResults.theoreticalBestRound.set(course.id, {
            roundVariety: RoundVariety.EIGHTEEN,
            strokes: [...EMPTY_EIGHTEEN_NUMBERS],
            course: course,
            bestScoresRecordedDateISO: Array<string>(18),
          });
          break;
        }
      }
    }
    const theoreticalBestRound = holeResults.theoreticalBestRound.get(
      course.id,
    );
    if ((theoreticalBestRound?.strokes?.[index] || Infinity) > strokes) {
      theoreticalBestRound!.strokes[index] = strokes;
      theoreticalBestRound!.bestScoresRecordedDateISO[index] = dateStringISO;
    }
  }

  private updateHoleResultTotals(
    holeResults: HoleResults,
    holeResultToPar: number,
  ): void {
    if (holeResultToPar <= -2) {
      holeResults.eaglesOrBetter++;
    } else if (holeResultToPar === -1) {
      holeResults.birdies++;
    } else if (holeResultToPar === 0) {
      holeResults.pars++;
    } else if (holeResultToPar === 1) {
      holeResults.bogeys++;
    } else if (holeResultToPar >= 2) {
      holeResults.doubleBogeysOrWorse++;
    }
  }

  private updateParStats(
    holeResults: HoleResults,
    parOnHole: number,
    strokes: number,
  ): void {
    switch (parOnHole) {
      case 3: {
        holeResults.par3sPlayed++;
        holeResults.totalStrokesOnPar3s += strokes;
        break;
      }
      case 4: {
        holeResults.par4sPlayed++;
        holeResults.totalStrokesOnPar4s += strokes;
        break;
      }
      case 5: {
        holeResults.par5sPlayed++;
        holeResults.totalStrokesOnPar5s += strokes;
        break;
      }
    }
  }

  public datePickerFilterOutBefore = (d: Date | null): boolean => {
    if (!this.currentUser?.earliestDateISO || !d) {
      return true;
    }
    return d >= new Date(this.currentUser.earliestDateISO);
  };

  public datePickerFilterOutAfter = (d: Date | null): boolean => {
    if (!this.currentUser?.latestDateISO || !d) {
      return true;
    }
    return d < new Date(this.currentUser.latestDateISO);
  };

  courseStatsFilter = new FormControl<string[]>([]);
  allSelected = false;
  courseIdOptions: Signal<string[]> = computed(() => [
    ...this.courseMap().keys(),
  ]);

  public readonly COURSE_NAME_COL = 'courseName';
  public readonly ROUND_DATE_COL = ROUND_DATE_SORT_COL;
  public readonly ROUND_SCORE_COL = ROUND_SCORE_SORT_COL;
  public readonly ROUND_TABLE_COLUMNS = [
    this.ROUND_DATE_COL,
    this.COURSE_NAME_COL,
    this.ROUND_SCORE_COL,
  ];

  public readonly BEST_ROUND_COURSE_NAME_COL = `${this.COURSE_NAME_COL}-best`;
  public readonly THEORETICAL_BEST_ROUND_COLUMNS = [
    this.BEST_ROUND_COURSE_NAME_COL,
    this.ROUND_DATE_COL,
  ];

  constructor(
    public appStateService: AppStateService,
    private readonly roundService: RoundService,
    public courseService: CourseService,
    private readonly roundScorePipe: TotalRoundScorePipe,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.currentUser?.name?.trim()}'s Results`,
    );
    this.rounds.set(
      this.roundService
        .getRoundsByIds(this.currentUser?.roundIds || [])
        .sort((a, b) => {
          if (a?.dateStringISO > b?.dateStringISO) {
            return 1;
          }
          if (a?.dateStringISO < b?.dateStringISO) {
            return -1;
          }
          return 0;
        }),
    );
  }

  ngAfterViewInit(): void {
    const courseStatsFilterSelect = this.currentUser?.courseStatsFilterSelect;
    if (courseStatsFilterSelect?.length) {
      this.courseStatsFilter.setValue(
        courseStatsFilterSelect.filter((courseId) =>
          this.courseMap().has(courseId),
        ),
      );
    } else {
      this.allSelected = true;
      this.courseStatsFilter.setValue(this.courseIdOptions());
    }
    this.reevaluateAllSelectedStatus(true);
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND);
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }

  public viewRound(roundId: string, message?: string): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND, {
      state: {
        [NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT]: roundId,
        [NAVIGATION_STATE_KEYS.MESSAGE]: message,
      },
    });
  }

  public toggleAllSelection(): void {
    if (this.allSelected) {
      this.select?.options?.forEach((item: MatOption) => item.select());
    } else {
      this.select?.options?.forEach((item: MatOption) => item.deselect());
    }
    this.reevaluateAllSelectedStatus();
  }

  public reevaluateAllSelectedStatus(save = false): void {
    let newStatus = true;
    let anyItemSelected = false;
    this.select?.options?.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      } else {
        anyItemSelected = true;
      }
    });
    if (save && !anyItemSelected) {
      this.courseStatsFilter.setValue(this.courseIdOptions());
      this.allSelected = true;
    } else {
      this.allSelected = newStatus;
    }

    this.updateFilteredRounds();

    if (save) {
      this.saveCourseStatsFilter();
    }
  }

  public filtersOpenChanged(open: boolean): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.filtersOpen = open;
        return structuredClone(user);
      });
    }
  }

  private saveCourseStatsFilter(): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.courseStatsFilterSelect = this.courseStatsFilter.value || [];
        return structuredClone(user);
      });
    }
  }

  public homeTabIndexChanged(index: number): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.homeTabIndex = index;
        return structuredClone(user);
      });
    }
  }

  public sortData(sort: Sort): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.sortBy = sort.active as ResultsSorting;
        user!.sortDescending = sort.direction === 'desc';
        return structuredClone(user);
      });
    }
    this.updateFilteredRounds();
  }

  private updateFilteredRounds(): void {
    const roundsToShow =
      this.rounds()?.filter((round) => this.shouldShowRound(round)) || [];
    if (this.currentUser && !this.currentUser?.sortBy) {
      this.currentUser.sortBy = ROUND_DATE_SORT_COL;
    }
    roundsToShow.sort((a, b) => {
      const roundAScore = Number(this.roundScorePipe.transform(a));
      const roundBScore = Number(this.roundScorePipe.transform(b));
      const isRoundAComplete = Number.isFinite(roundAScore);
      const isRoundBComplete = Number.isFinite(roundBScore);
      if (!isRoundAComplete) {
        return -1;
      }
      if (!isRoundBComplete) {
        return 1;
      }
      if (this.currentUser?.sortBy === this.ROUND_DATE_COL) {
        return this.currentUser?.sortDescending
          ? new Date(b.dateStringISO).getTime() -
              new Date(a.dateStringISO).getTime()
          : new Date(a.dateStringISO).getTime() -
              new Date(b.dateStringISO).getTime();
      } else if (this.currentUser?.sortBy === this.ROUND_SCORE_COL) {
        return this.currentUser?.sortDescending
          ? roundBScore - roundAScore
          : roundAScore - roundBScore;
      }
      return 0;
    });
    this.filteredRounds.set(roundsToShow);
  }

  private shouldShowRound(round: Round) {
    if (
      this.courseStatsFilter.value?.length &&
      this.courseStatsFilter.value.length !== this.courseIdOptions()?.length &&
      !this.courseStatsFilter.value.includes(round?.courseId)
    ) {
      return false;
    }
    if (round?.dateStringISO) {
      const roundDate = new Date(round.dateStringISO);
      if (
        this.currentUser?.earliestDateISO &&
        new Date(this.currentUser.earliestDateISO) > roundDate
      ) {
        return false;
      }
      if (
        this.currentUser?.latestDateISO &&
        new Date(this.currentUser.latestDateISO) <= roundDate
      ) {
        return false;
      }
    }
    return true;
  }

  public earliestDateChanged(
    event: MatDatepickerInputEvent<Date> | null,
    picker?: MatDatepicker<Date>,
  ): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.earliestDateISO = event?.value?.toISOString();
        return structuredClone(user);
      });
      this.updateFilteredRounds();
      picker?.close();
    }
  }

  public latestDateChanged(
    event: MatDatepickerInputEvent<Date> | null,
    picker?: MatDatepicker<Date>,
  ): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.latestDateISO = DataUtils.justBeforeNextDay(
          event?.value,
        )?.toISOString();
        return structuredClone(user);
      });
      this.updateFilteredRounds();
      picker?.close();
    }
  }

  public clearRoundFilters(): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        delete user!.earliestDateISO;
        delete user!.latestDateISO;
        return structuredClone(user);
      });
      this.select?.options?.forEach((item: MatOption) => item.deselect());
      this.reevaluateAllSelectedStatus(true);
    }
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }

  public viewBestRoundOnCourse(courseId: string): void {
    const bestRound: BestRound =
      this.holeResultTotals().theoreticalBestRound.get(courseId)!;
    this.dialog.open(BestRoundDialogComponent, {
      data: bestRound,
    });
  }

  public openTrendGraphDialog(which: PerformanceGraphMetric): void {
    const data: PerformanceGraphData = {
      title: this.getTrendDialogName(which),
      percent: true,
      dataPoints: this.filteredRounds()
        .map((round) => {
          const holeResults: HoleResults = createEmptyHoleResults();
          const dataPoint: PerformanceGraphDataPoint = {
            yValue: null,
            dateStringISO: round.dateStringISO,
            roundVariety: round.roundVariety,
          };
          const course = this.courseMap().get(round.courseId);
          if (!course) {
            return dataPoint;
          }
          for (let index = 0; index < round.strokes.length; index++) {
            this.processHoleResult(holeResults, round, course, index);
          }
          dataPoint.yValue = this.getTrendMeasureValue(holeResults, which);
          return dataPoint;
        })
        .filter((round) => round.yValue !== null),
    };
    console.log(data);
    this.dialog.open(PerformanceGraphDialogComponent, {
      data: data,
    });
  }

  private getTrendDialogName(which: PerformanceGraphMetric): string {
    switch (which) {
      case 'greens-in-regulation':
        return 'GIR Trend';
      case 'scrambling':
        return 'Scrambling Trend';
    }
  }

  public getTrendMeasureValue(
    holeResults: HoleResults,
    which: PerformanceGraphMetric,
  ): number | null {
    switch (which) {
      case 'greens-in-regulation':
        return holeResults.holesPlayedWithPutts
          ? holeResults.inferredGreensInRegulation /
              holeResults.holesPlayedWithPutts
          : null;
      case 'scrambling':
        return holeResults.inferredHolesScramblingNeeded
          ? holeResults.inferredHolesScramblingSuccessfully /
              holeResults.inferredHolesScramblingNeeded
          : null;
    }
  }
}
