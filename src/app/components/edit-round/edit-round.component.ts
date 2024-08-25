import { Component } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { Router } from '@angular/router';
import { NAVIGATION_STATE_KEYS, APP_ROUTES } from '../../models/constants';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { Course } from '../../models/course';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppStateService } from '../../services/app-state.service';
import { Round } from '../../models/round';
import { RoundService } from '../../services/round.service';
import { MatSelectModule } from '@angular/material/select';
import { ParPipe } from '../../pipes/par.pipe';
import { DatePipe } from '@angular/common';

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
    MatSelectModule,
    DatePipe,
  ],
  providers: [DatePipe],
  templateUrl: './edit-round.component.html',
  styleUrl: './edit-round.component.scss',
})
export class EditRoundComponent {
  public editingRound: Round;
  public coursesToChooseFrom: Course[];
  private roundIdToEdit: string;
  public readonly HOLE_COL = 'hole';
  public readonly PAR_COL = 'par';
  public readonly PUTTS_COL = 'putts';
  public readonly ROUND_TABLE_COLUMNS = [
    {
      columnDef: this.HOLE_COL,
      header: 'Hole',
    },
    {
      columnDef: this.PAR_COL,
      header: 'Par',
    },
    {
      columnDef: this.PUTTS_COL,
      header: 'Putts',
    },
  ];
  public readonly ROUND_TABLE_COLUMN_IDS = this.ROUND_TABLE_COLUMNS.map(
    (def) => def.columnDef
  );

  constructor(
    private appStateService: AppStateService,
    private courseService: CourseService,
    private roundService: RoundService,
    private router: Router,
    private datePipe: DatePipe
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

  public strokesPlusOne(index: number) {
    this.editingRound.strokes[index]++;
  }

  public strokesMinusOne(index: number) {
    this.editingRound.strokes[index]--;
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

  public saveRound(): void {
    if (!this.roundIdToEdit) {
      this.appStateService.currentUser?.roundIds.push(this.editingRound.id);
    }
    this.appStateService.saveCurrentUser();
    this.roundService.saveRounds([this.editingRound]);
    this.router.navigateByUrl(APP_ROUTES.HOME);
  }
}
