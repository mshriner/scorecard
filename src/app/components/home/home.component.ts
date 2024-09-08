import { DatePipe } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
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
import { SnackBarService } from '../../services/snack-bar.service';

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
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public rounds: WritableSignal<Round[]> = signal([]);
  public courseMap: Map<string, Course | null> = new Map();
  public currentUser: User | null;

  public readonly COURSE_NAME_COL = 'courseName';
  public readonly ROUND_DATE_COL = 'roundDate';
  public readonly ROUND_SCORE_COL = 'roundScore';
  public readonly ROUND_TABLE_COLUMNS = [
    this.ROUND_DATE_COL,
    this.COURSE_NAME_COL,
    this.ROUND_SCORE_COL,
  ];

  constructor(
    private appStateService: AppStateService,
    private roundService: RoundService,
    public courseService: CourseService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {
    this.currentUser = this.appStateService.currentUser;
  }

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.appStateService.currentUser?.name}`
    );
    this.rounds.set(
      this.roundService.getRoundsByIds(
        this.appStateService.currentUser?.roundIds || []
      )
    );
    this.rounds().forEach((round) => {
      if (!this.courseMap.has(round.courseId)) {
        const course = this.courseService.getCourse(round.courseId);
        this.courseMap.set(round.courseId, course);
      }
    });
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }

  public addNewRound(): void {
    if (!this.courseService.getAllCoursesForCurrentUser()?.length) {
      this.snackBarService.openTemporarySnackBar('Please add a course first.');
    } else {
      this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND);
    }
  }

  public saveUser(): void {
    this.appStateService.currentUser = this.currentUser;
    setTimeout(() => window.location.reload());
  }

  public formatLabel(value?: number): string {
    switch (value) {
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
}
