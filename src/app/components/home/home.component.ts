import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
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
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { CourseVariety } from '../../models/course';
import {
  createEmptyHoleResults,
  GRAPH_VARIETIES,
  HoleResults,
  PerformanceGraphData,
  PerformanceGraphDataPoint,
  PerformanceGraphMetric,
} from '../../models/graph';
import {
  BestRound,
  compareRoundsByDateDescending,
  FullRoundVarietyAtCourse,
  Round,
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
import { NavigationMessageService } from '../../services/navigation-message.service';
import { RoundService } from '../../services/round.service';
import { StatisticsService } from '../../services/statistics.service';
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
    MatDividerModule,
    MatDialogModule,
    TypedTemplateDirective,
    DatePipe,
    DecimalPipe,
    NgTemplateOutlet,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  appStateService = inject(AppStateService);
  private readonly roundService = inject(RoundService);
  readonly statisticsService = inject(StatisticsService);
  readonly courseService = inject(CourseService);
  private readonly roundScorePipe = inject(TotalRoundScorePipe);
  private readonly router = inject(NavigationMessageService);
  readonly dialog = inject(MatDialog);

  @ViewChild('courseStatsFilterSelect') select!: MatSelect;

  public readonly Array = Array;
  public readonly FullRoundVarietyAtCourse = FullRoundVarietyAtCourse;
  public readonly CourseVariety = CourseVariety;
  public readonly GRAPH_VARIETIES = GRAPH_VARIETIES;
  public TREND_GRAPH_PARAMS!: {
    which: PerformanceGraphMetric;
  };

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
    ...this.statisticsService.courseMap().keys(),
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

  constructor() {
    effect(() => {
      this.appStateService.currentUser();
      this.setPageTitle();
    });
  }

  ngOnInit(): void {
    this.setPageTitle();
    this.statisticsService.rounds.set(
      this.roundService
        .getRoundsByIds(this.currentUser?.roundIds || [])
        .sort(compareRoundsByDateDescending),
    );
  }

  private setPageTitle() {
    this.appStateService.setPageTitle(
      `${this.currentUser?.name?.trim()}'s Results`,
    );
  }

  ngAfterViewInit(): void {
    const courseStatsFilterSelect = this.currentUser?.courseStatsFilterSelect;
    if (courseStatsFilterSelect?.length) {
      this.courseStatsFilter.setValue(
        courseStatsFilterSelect.filter((courseId) =>
          this.statisticsService.courseMap().has(courseId),
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
    this.router.navigateByUrl(
      APP_ROUTES.ADD_EDIT_ROUND,
      {
        state: {
          [NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT]: roundId,
        },
      },
      message,
    );
  }

  public toggleAllSelection(): void {
    if (this.allSelected) {
      for (const item of this.select?.options ?? []) {
        item.select();
      }
    } else {
      for (const item of this.select?.options ?? []) {
        item.deselect();
      }
    }
    this.reevaluateAllSelectedStatus();
  }

  public reevaluateAllSelectedStatus(save = false): void {
    let newStatus = true;
    let anyItemSelected = false;
    for (const item of this.select?.options ?? []) {
      if (item.selected) {
        anyItemSelected = true;
      } else {
        newStatus = false;
      }
    }

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
      this.statisticsService
        .rounds()
        ?.filter((round) => this.shouldShowRound(round)) || [];
    if (this.currentUser && !this.currentUser?.sortBy) {
      this.currentUser.sortBy = ROUND_DATE_SORT_COL;
    }
    roundsToShow.sort((a, b) => {
      const roundAScore = Number(this.roundScorePipe.transform(a, a.roundVariety));
      const roundBScore = Number(this.roundScorePipe.transform(b, b.roundVariety));
      const isRoundAComplete = Number.isFinite(this.roundScorePipe.transform(a));
      const isRoundBComplete = Number.isFinite(this.roundScorePipe.transform(b));
      if (isRoundAComplete !== isRoundBComplete) {
        if (!isRoundAComplete) {
          return -1;
        }
        if (!isRoundBComplete) {
          return 1;
        }
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
    this.statisticsService.filteredRounds.set(roundsToShow);
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
      for (const item of this.select?.options ?? []) {
        item.deselect();
      }
      this.reevaluateAllSelectedStatus(true);
    }
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }

  public viewBestRoundOnCourse(courseId: string): void {
    const bestRound: BestRound = this.statisticsService
      .holeResultTotals()
      .theoreticalBestRound.get(courseId)!;
    this.dialog.open(BestRoundDialogComponent, {
      data: bestRound,
    });
  }

  public openTrendGraphDialog(which: PerformanceGraphMetric): void {
    const graphDetails = GRAPH_VARIETIES[which];
    const data: PerformanceGraphData = {
      yAxisLabel: graphDetails.yAxisLabel,
      percent: graphDetails.percent,
      scoreToPar: graphDetails.scoreToPar,
      sortedDataPoints: this.statisticsService
        .filteredRounds()
        .map((round) => {
          const holeResults: HoleResults = createEmptyHoleResults();
          const dataPoint: PerformanceGraphDataPoint = {
            yValue: null,
            roundId: round.id,
            date: new Date(round.dateStringISO),
            roundVariety: round.roundVariety,
          };
          const addYValue = this.statisticsService.processHoles(
            round,
            holeResults,
          );
          if (addYValue) {
            dataPoint.yValue = graphDetails.yValueExtractor(holeResults);
          }
          return dataPoint;
        })
        .filter((round) => round.yValue !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
    this.dialog.open(PerformanceGraphDialogComponent, {
      data: data,
    });
  }
}
