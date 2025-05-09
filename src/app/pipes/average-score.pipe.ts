import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';
import { Round, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

interface NineHoleScoreWithCourse {
  score: number[];
  courseId: string;
  frontOrBack: RoundVariety;
}

@Pipe({
  name: 'averageScore',
  standalone: false,
})
export class AverageScorePipe implements PipeTransform {
  constructor(private readonly decimal: DecimalPipe) {}

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
      '1.0-1',
    )}`;
  }
}

@Pipe({
  name: 'averageScoreToPar',
  standalone: false,
})
export class AverageScoreToParPipe implements PipeTransform {
  constructor(
    private readonly roundVarietyScores: RoundVarietyScoresPipe,
    private readonly decimal: DecimalPipe,
  ) {}

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
      return `+${this.decimal.transform(toPar, '1.0-1')}`;
    } else if (toPar < 0) {
      return `${this.decimal.transform(toPar, '1.0-1')}`;
    }
    return `E`;
  }
}

@Pipe({
  name: 'countValidRoundsToAverage',
  standalone: false,
})
export class CountValidRoundsToAveragePipe implements PipeTransform {
  constructor() {}

  transform(rounds: Round[], eighteenHolesOnly: 9 | 18): number {
    return getNineHoleRoundsToCount(rounds, eighteenHolesOnly).length;
  }
}

const EMPTY_NINE_HOLES = [0, 0, 0, 0, 0, 0, 0, 0, 0];

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
      strokes.slice(0, 9).length === 9 ? strokes.slice(0, 9) : EMPTY_NINE_HOLES;
    const backNine =
      strokes.slice(9, 18).length === 9
        ? strokes.slice(9, 18)
        : EMPTY_NINE_HOLES;

    const isFrontValid = !frontNine.some((stroke) => !stroke);
    const isBackValid = !backNine.some((stroke) => !stroke);

    if (eighteenHolesOnly === 18 && (!isFrontValid || !isBackValid)) {
      continue;
    }

    if (isFrontValid) {
      toCount.push({
        score: frontNine,
        courseId: round.courseId,
        frontOrBack: RoundVariety.FRONT_NINE,
      });
    }
    if (isBackValid) {
      toCount.push({
        score: backNine,
        courseId: round.courseId,
        frontOrBack: RoundVariety.BACK_NINE,
      });
    }
  }

  return toCount;
}
