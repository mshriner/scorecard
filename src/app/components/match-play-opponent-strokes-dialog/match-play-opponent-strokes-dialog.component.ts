import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import {
  EIGHTEEN_NUMBERS_ZEROED,
  NINE_NUMBERS_ZEROED,
} from '../../models/course';
import { MatchPlayDetails, Round, RoundVariety } from '../../models/round';
import { EighteenNumbers, NineNumbers } from '../../models/storage-object';
import { ColumnDef } from '../../models/table';
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-match-play-opponent-strokes-dialog',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    FormsModule,
    PipesModule,
    NgTemplateOutlet,
    TypedTemplateDirective,
  ],
  templateUrl: './match-play-opponent-strokes-dialog.component.html',
  styleUrl: './match-play-opponent-strokes-dialog.component.scss',
})
export class MatchPlayOpponentStrokesDialogComponent {
  readonly dialogRef = inject(
    MatDialogRef<MatchPlayOpponentStrokesDialogComponent>,
  );
  public readonly round: Round = inject<Round>(MAT_DIALOG_DATA);
  public opponentName = this.round.matchPlay?.opponentName ?? 'Opponent';
  public userHandicapIsHigher = signal(this.isUserHandicapHigherThanOpponent());
  public opponentAdvantage = this.getInitialOpponentAdvantage();

  public readonly FRONT_NINE = RoundVariety.FRONT_NINE;
  public readonly BACK_NINE = RoundVariety.BACK_NINE;
  public readonly HOLE_COL = 'hole';
  public readonly STROKES_COL = 'strokes';
  public readonly HOLE_SUMMARY_COL = 'holeSummary';
  public readonly STROKES_SUMMARY_COL = 'strokesSummary';

  public readonly ROUND_TABLE_COLUMNS: ColumnDef[] = [
    {
      columnDef: this.HOLE_COL,
      header: 'Hole',
    },
    {
      columnDef: this.STROKES_COL,
      header: 'Strokes Given',
    },
  ];

  private readonly ROUND_TABLE_COLUMN_IDS = [this.HOLE_COL, this.STROKES_COL];

  private readonly ROUND_TABLE_SUMMARY_COLUMN_IDS = [
    this.HOLE_SUMMARY_COL,
    this.STROKES_SUMMARY_COL,
  ];

  readonly roundTableColumns = computed(() => {
    return this.ROUND_TABLE_COLUMNS.map((col) => ({
      ...col,
      header:
        col.columnDef === this.STROKES_COL
          ? this.getStrokesColumnHeader()
          : col.header,
    }));
  });

  readonly roundTableColumnIds = computed(() => this.ROUND_TABLE_COLUMN_IDS);
  readonly roundTableSummaryColumnIds = computed(
    () => this.ROUND_TABLE_SUMMARY_COLUMN_IDS,
  );

  public HOLE_ROW_TYPES!: {
    holeIndex: number;
    column: ColumnDef;
  };
  public SUMMARY_ROW_TYPES!: {
    outOrIn: RoundVariety;
    columnId: string;
  };

  public updateRelativeHandicap(value: string): void {
    this.userHandicapIsHigher.set(value === 'higher');
  }

  public get holeCount(): number {
    return this.getHoleCount();
  }

  public get handicapDifferenceText(): string {
    const difference = this.opponentAdvantage.filter(
      (value) => value !== 0,
    ).length;

    if (difference === 0) {
      return 'Handicap difference: Even';
    }

    return `Handicap difference: ${difference}`;
  }

  public readonly getStrokesColumnHeader = computed(() => {
    return this.userHandicapIsHigher()
      ? 'Advantage Received'
      : 'Advantage Given';
  });

  public isHoleSelected(index: number): boolean {
    return (this.opponentAdvantage[index] ?? 0) !== 0;
  }

  public toggleHole(index: number): void {
    const currentValue = this.opponentAdvantage[index] ?? 0;
    if (currentValue === 0) {
      this.opponentAdvantage[index] = this.userHandicapIsHigher() ? 1 : -1;
    } else {
      this.opponentAdvantage[index] = 0;
    }
  }

  public getHoleValue(index: number): number {
    const value = this.opponentAdvantage[index] ?? 0;
    return Math.abs(value);
  }

  public incrementHole(index: number): void {
    const currentValue = Math.abs(this.opponentAdvantage[index] ?? 0);
    this.opponentAdvantage[index] = currentValue + 1;
  }

  public decrementHole(index: number): void {
    const currentValue = Math.abs(this.opponentAdvantage[index] ?? 0);
    if (currentValue > 1) {
      this.opponentAdvantage[index] = currentValue - 1;
    } else {
      this.opponentAdvantage[index] = 0;
    }
  }

  public showSummaryRow(index: number): boolean {
    const roundVariety = this.round?.roundVariety;
    if (
      roundVariety === RoundVariety.FRONT_NINE ||
      roundVariety === RoundVariety.BACK_NINE ||
      roundVariety === RoundVariety.FULL_NINE
    ) {
      return (index + 1) % 9 === 0;
    }
    return (index + 1) % 18 === 0;
  }

  public returnTrue(): boolean {
    return true;
  }

  public save(): void {
    const result: MatchPlayDetails = {
      opponentName: this.opponentName.trim() || 'Opponent',
      opponentAdvantage: structuredClone(
        this.userHandicapIsHigher()
          ? (this.opponentAdvantage.map((v) => -1 * v + 0) as
              | NineNumbers
              | EighteenNumbers)
          : this.opponentAdvantage,
      ),
      showOpponentScores: this.round.matchPlay?.showOpponentScores ?? false,
    };
    this.dialogRef.close(result);
  }

  public close(): void {
    this.dialogRef.close();
  }

  private getHoleCount(): 9 | 18 {
    const holeCount = this.round?.strokes?.length ?? 18;
    return holeCount || 18;
  }

  private isUserHandicapHigherThanOpponent(): boolean {
    const existing = this.round.matchPlay?.opponentAdvantage ?? [];
    if (existing.some((value) => value && value < 0)) {
      return true;
    }
    if (existing.some((value) => value && value > 0)) {
      return false;
    }
    return true;
  }

  private getInitialOpponentAdvantage(): NineNumbers | EighteenNumbers {
    const holeCount = this.getHoleCount();
    const defaultValues = structuredClone(
      holeCount === 9 ? NINE_NUMBERS_ZEROED : EIGHTEEN_NUMBERS_ZEROED,
    );
    const existing = (this.round.matchPlay?.opponentAdvantage ?? []).map(
      (value) => Math.abs(value || 0),
    );

    for (let index = 0; index < defaultValues.length; index++) {
      defaultValues[index] = existing[index] ?? 0;
    }

    return defaultValues;
  }
}
