import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { Course, NINE_NUMBERS_ZEROED } from '../models/course';
import { Round, RoundVariety } from '../models/round';
import { NineNumbers } from '../models/storage-object';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

interface NineHoleScoreWithCourse {
  score: NineNumbers;
  courseId: string;
  frontOrBack: RoundVariety;
}

@Pipe({ name: 'averageScore' })
export class AverageScorePipe implements PipeTransform {
  private readonly decimal = inject(DecimalPipe);

  transform(rounds: Round[], eighteenHolesOnly: 9 | 18): string {
    const roundHalvesThatCount = getNineHoleRoundsToCount(
      rounds,
      eighteenHolesOnly,
    );

    if (!roundHalvesThatCount?.length) {
      return '--';
    }

    return `${this.decimal.transform(
      roundHalvesThatCount
        .map((toCount) => toCount.score.reduce((p, c) => p + c, 0))
        .reduce((prev, curr) => prev + curr, 0) /
        (roundHalvesThatCount.length * (eighteenHolesOnly === 18 ? 0.5 : 1)),
      '1.1-1',
    )}`;
  }
}

@Pipe({ name: 'averageScoreToPar' })
export class AverageScoreToParPipe implements PipeTransform {
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);
  private readonly decimal = inject(DecimalPipe);

  transform(
    rounds: Round[],
    courseMap: Map<string, Course | null>,
    eighteenHolesOnly: 9 | 18,
  ): string {
    let scoresToPar: number[] = [];
    const roundHalvesThatCount = getNineHoleRoundsToCount(
      rounds,
      eighteenHolesOnly,
    );

    if (!roundHalvesThatCount?.length) {
      return '--';
    }

    for (const roundHalf of roundHalvesThatCount) {
      scoresToPar.push(
        roundHalf.score.reduce((p, c) => p + c, 0) -
          (this.roundVarietyScores
            .transform(
              courseMap.get(roundHalf.courseId)?.par,
              roundHalf.frontOrBack,
            )
            .reduce((p, c) => (p ?? 0) + (c ?? 0), 0) ?? 0),
      );
    }
    const toPar =
      scoresToPar.reduce((prev, curr) => prev + curr, 0) /
      (scoresToPar.length * (eighteenHolesOnly === 18 ? 0.5 : 1));
    if (toPar > 0) {
      return `+${this.decimal.transform(toPar, '1.1-1')}`;
    } else if (toPar < 0) {
      return `${this.decimal.transform(toPar, '1.1-1')}`;
    }
    return `E`;
  }
}

@Pipe({ name: 'countValidRoundsToAverage' })
export class CountValidRoundsToAveragePipe implements PipeTransform {
  constructor() {}

  transform(rounds: Round[], eighteenHolesOnly: 9 | 18): number {
    return getNineHoleRoundsToCount(rounds, eighteenHolesOnly).length;
  }
}

function getNineHoleRoundsToCount(
  rounds: Round[],
  eighteenHolesOnly: 9 | 18,
): NineHoleScoreWithCourse[] {
  const toCount: NineHoleScoreWithCourse[] = [];

  if (!rounds?.length) {
    return toCount;
  }

  for (const round of rounds) {
    const strokes = round?.strokes ?? [];
    const frontNine =
      strokes.slice(0, 9).length === 9
        ? strokes.slice(0, 9)
        : NINE_NUMBERS_ZEROED;
    const backNine =
      strokes.slice(9, 18).length === 9
        ? strokes.slice(9, 18)
        : NINE_NUMBERS_ZEROED;

    const isFrontValid = !frontNine.some((stroke) => !stroke);
    const isBackValid = !backNine.some((stroke) => !stroke);

    if (eighteenHolesOnly === 18 && (!isFrontValid || !isBackValid)) {
      continue;
    }

    if (isFrontValid) {
      toCount.push({
        score: frontNine as NineNumbers,
        courseId: round.courseId,
        frontOrBack: RoundVariety.FRONT_NINE,
      });
    }
    if (isBackValid) {
      toCount.push({
        score: backNine as NineNumbers,
        courseId: round.courseId,
        frontOrBack: RoundVariety.BACK_NINE,
      });
    }
  }

  return toCount;
}
