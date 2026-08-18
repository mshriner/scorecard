import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import { CourseVariety } from '../../models/course';
import { BestRound, RoundVariety } from '../../models/round';
import { ColumnDef } from '../../models/table';
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-best-round-dialog',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    PipesModule,
    TypedTemplateDirective,
    DatePipe,
    NgTemplateOutlet,
  ],
  templateUrl: './best-round-dialog.component.html',
  styleUrl: './best-round-dialog.component.scss',
})
export class BestRoundDialogComponent {
  readonly dialogRef = inject(MatDialogRef<BestRoundDialogComponent>);
  public readonly bestPossibleRound: BestRound =
    inject<BestRound>(MAT_DIALOG_DATA);

  public readonly FRONT_NINE = RoundVariety.FRONT_NINE;
  public readonly BACK_NINE = RoundVariety.BACK_NINE;
  public readonly HOLE_COL = 'hole';
  public readonly STROKES_COL = 'strokes';
  public readonly DATE_RECORDED_COL = 'dateRecorded';
  public readonly HOLE_SUMMARY_COL = 'holeSummary';
  public readonly STROKES_SUMMARY_COL = 'strokesSummary';
  public readonly EMPTY_COL = 'dateRecordedEmpty';
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
      columnDef: this.DATE_RECORDED_COL,
      header: 'Date',
    },
  ];
  public readonly ROUND_TABLE_COLUMN_IDS = [
    this.HOLE_COL,
    this.STROKES_COL,
    this.DATE_RECORDED_COL,
  ];
  public readonly ROUND_TABLE_SUMMARY_COLUMN_IDS = [
    this.HOLE_SUMMARY_COL,
    this.STROKES_SUMMARY_COL,
    this.EMPTY_COL,
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

  public get isNineHoleCourse(): boolean {
    return this.bestPossibleRound.course?.numberOfHoles === CourseVariety.NINE;
  }

  public returnTrue(): boolean {
    return true;
  }

  public showSummaryRow(index: number): boolean {
    return !this.isNineHoleCourse && (index + 1) % 9 === 0;
  }
}
