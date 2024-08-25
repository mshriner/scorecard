import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Round } from '../../models/round';
import { ScoreToParPipe } from '../../pipes/score-to-par.pipe';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserService } from '../../services/user.service';
import { APP_ROUTES } from '../../models/constants';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    ScoreToParPipe,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public rounds: WritableSignal<Round[]> = signal([]);

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
    private userService: UserService,
    private roundService: RoundService,
    public courseService: CourseService,
    private snackBarService: SnackBarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.appStateService.currentUser?.name}`
    );
    this.rounds.set(
      this.roundService.getRoundsByIds(
        this.appStateService.currentUser?.roundIds || []
      )
    );
  }

  public addNewRound(): void {
    if (!this.courseService.getAllCoursesForCurrentUser()?.length) {
      this.snackBarService.openTemporarySnackBar('Please add a course first.');
    }
  }

  public viewRound(roundId: string): void {}
}
