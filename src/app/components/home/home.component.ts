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
import { MatOption, MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { Round } from '../../models/round';
import { User } from '../../models/user';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    PipesModule,
    DatePipe,
    MatButtonModule,
    MatRippleModule,
    MatCardModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    CommonModule,
    MatDividerModule,
  ],
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
  public currentUser: User | null;

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
    private roundService: RoundService,
    public courseService: CourseService,
    private router: Router,
  ) {
    this.currentUser = this.appStateService.currentUser;
  }

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.appStateService.currentUser?.name?.trim()}'s Results`,
    );
    this.rounds.set(
      this.roundService.getRoundsByIds(
        this.appStateService.currentUser?.roundIds || [],
      ),
    );
  }

  ngAfterViewInit(): void {
    if (this.currentUser?.courseStatsFilterSelect?.length) {
      this.courseStatsFilter.setValue(this.currentUser.courseStatsFilterSelect);
      this.reevaluateAllSelectedStatus();
    } else {
      this.allSelected = true;
      this.courseStatsFilter.setValue(this.courseIdOptions());
      this.updateFilteredRounds();
    }
  }

  public saveUser(): void {
    this.appStateService.currentUser = this.currentUser;
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND);
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }

  public formatLabel(value?: number): string {
    switch (value) {
      case 3:
        return 'XL';
      case 2:
        return 'L';
      case 1:
        return 'M';
      case 0:
      default:
        return 'S';
    }
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

  private saveCourseStatsFilter(): void {
    if (this.currentUser) {
      this.currentUser.courseStatsFilterSelect =
        this.courseStatsFilter.value || [];
      this.saveUser();
    }
  }

  private updateFilteredRounds(): void {
    this.filteredRounds.set(
      this.rounds()?.filter((round) =>
        this.courseStatsFilter.value?.length
          ? this.courseStatsFilter.value?.includes(round?.courseId)
          : true,
      ) || [],
    );
  }
}
