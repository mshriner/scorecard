import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { Round } from '../../models/round';
import { ParPipe } from '../../pipes/par.pipe';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { TotalPuttsPipe } from '../../pipes/total-putts.pipe';
import { ScoreToParPipe } from '../../pipes/score-to-par.pipe';
import { TotalRoundScorePipe } from '../../pipes/total-round-score.pipe';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';

@Component({
  selector: 'app-edit-round',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    ParPipe,
    ScoreToParPipe,
    MatSelectModule,
    DatePipe,
    TotalRoundScorePipe,
    TotalPuttsPipe,
    CommonModule,
    TypedTemplateDirective
  ],
  providers: [DatePipe],
  templateUrl: './edit-round.component.html',
  styleUrl: './edit-round.component.scss',
})
export class EditRoundComponent {
  public editingRound: Round;
  public coursesToChooseFrom: Course[];
  public currentCourse: Course | null = null;
  public roundIdToEdit: string;
  public readonly HOLE_COL = 'hole';
  public readonly STROKES_COL = 'par';
  public readonly PUTTS_COL = 'putts';
  public readonly ROUND_TABLE_COLUMNS = [
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
  public readonly ROUND_TABLE_COLUMN_IDS = this.ROUND_TABLE_COLUMNS.map(
    (def) => def.columnDef
  );
  public SCORE_GRAPHIC_TYPES!: {
    score: number,
    scoreToPar: number
  }

  constructor(
    private appStateService: AppStateService,
    private courseService: CourseService,
    private roundService: RoundService,
    private router: Router,
    datePipe: DatePipe
  ) {
    this.coursesToChooseFrom = this.courseService.getAllCoursesForCurrentUser();
    this.roundIdToEdit =
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT
      ];
    console.log(this.roundIdToEdit);
    if (this.roundIdToEdit) {
      const retrieved = this.roundService.getRoundsByIds([
        this.roundIdToEdit,
      ])[0];
      this.editingRound = JSON.parse(JSON.stringify(retrieved));
      this.appStateService.setPageTitle(
        `Editing ${datePipe.transform(retrieved?.dateStringISO)}`
      );
      this.updateCurrentCourse(this.editingRound.courseId);
    } else {
      this.editingRound = {
        id: `round-${crypto.randomUUID()}`,
        strokes: new Array(18).fill(0),
        putts: new Array(18).fill(undefined),
        courseId: '',
        dateStringISO: new Date().toISOString(), // TODO: make editable
      };
      this.appStateService.setPageTitle(`Create Round`);
    }
  }

  public updateCurrentCourse(newCourseId: string): void {
    console.log('selected course', newCourseId);
    this.currentCourse = this.courseService.getCourse(newCourseId);
  }

  public strokesPlusOne(index: number) {
    this.editingRound.strokes[index]++;
  }

  public strokesMinusOne(index: number) {
    if (this.editingRound.strokes[index]) {
      this.editingRound.strokes[index]--;
    }
  }

  public puttsPlusOne(index: number) {
    if (!this.editingRound.putts[index]) {
      this.editingRound.putts[index] = 0;
    }
    this.editingRound.putts[index]++;
  }

  public puttsMinusOne(index: number) {
    if (!this.editingRound.putts[index]) {
      this.editingRound.putts[index] = 0;
    } else {
      this.editingRound.putts[index]--;
    }
  }

  public get disableSaveButton(): boolean {
    return (
      !this.editingRound.courseId.length ||
      this.editingRound.strokes.some((hole) => (hole || 0) <= 0)
    );
  }

  public deleteRound(): void {
    const updatedCurrentUser = this.appStateService.currentUser;
    if (updatedCurrentUser) {
      updatedCurrentUser.roundIds = updatedCurrentUser.roundIds.filter(roundId => roundId !== this.roundIdToEdit);
    }
    this.appStateService.currentUser = updatedCurrentUser;
    this.roundService.deleteRounds([this.roundIdToEdit]);
    this.router.navigateByUrl(APP_ROUTES.HOME);
  }

  public saveRound(): void {
    if (!this.roundIdToEdit) {
      this.appStateService.currentUser?.roundIds.push(this.editingRound.id);
    }
    this.appStateService.saveCurrentUser();
    this.roundService.saveRounds([this.editingRound]);
    this.router.navigateByUrl(APP_ROUTES.HOME);
  }
}
