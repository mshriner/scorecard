import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
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
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { Round } from '../../models/round';
import { LocalUserWithFilters } from '../../models/user';
import { PipesModule } from '../../pipes/pipes.module';
import { TotalRoundScorePipe } from '../../pipes/total-round-score.pipe';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';

@Component({
  selector: 'app-home',
  imports: [
    MatTableModule,
    MatIconModule,
    PipesModule,
    DatePipe,
    MatDatepickerModule,
    MatButtonModule,
    MatRippleModule,
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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('courseStatsFilterSelect') select!: MatSelect;

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
  public readonly ROUND_DATE_COL = 'roundDate';
  public readonly ROUND_SCORE_COL = 'roundScore';
  public readonly ROUND_TABLE_COLUMNS = [
    this.ROUND_DATE_COL,
    this.COURSE_NAME_COL,
    this.ROUND_SCORE_COL,
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

  public viewRound(roundId: string): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND, {
      state: {
        [NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT]: roundId,
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

  public sortData(sort: Sort): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.sortBy = sort.active;
        user!.sortDescending = sort.direction === 'desc';
        return structuredClone(user);
      });
    }
    this.updateFilteredRounds();
  }

  private updateFilteredRounds(): void {
    const roundsToShow =
      this.rounds()?.filter((round) => this.shouldShowRound(round)) || [];
    if (!this.currentUser?.sortBy) {
      this.currentUser!.sortBy = 'date';
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
    picker: MatDatepicker<Date>,
  ): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.earliestDateISO = event?.value?.toISOString();
        return structuredClone(user);
      });
      this.updateFilteredRounds();
      picker.close();
    }
  }

  public latestDateChanged(
    event: MatDatepickerInputEvent<Date> | null,
    picker: MatDatepicker<Date>,
  ): void {
    if (this.currentUser) {
      this.appStateService.currentUser.update((user) => {
        user!.latestDateISO = this.justBeforeNextDay(
          event?.value,
        )?.toISOString();
        return structuredClone(user);
      });
      this.updateFilteredRounds();
      picker.close();
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

  private justBeforeNextDay(date?: Date | null): Date | null {
    if (!date) {
      return null;
    }
    const newDate = new Date(date.valueOf());
    newDate.setDate(date.getDate() + 1);
    newDate.setMilliseconds(date.getMilliseconds() - 1);
    return newDate;
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }
}
