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
})
export class AverageScorePipe implements PipeTransform {
  constructor(private decimal: DecimalPipe) {}

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
        .map((toCount) => toCount.score.reduce((p, c) => p + c))
        .reduce((prev, curr) => prev + curr) /
        (roundHalvesThatCount.length * (eighteenHolesOnly === 18 ? 0.5 : 1)),
      '1.0-1',
    )}`;
  }
}

@Pipe({
  name: 'averageScoreToPar',
})
export class AverageScoreToParPipe implements PipeTransform {
  constructor(
    private roundVarietyScores: RoundVarietyScoresPipe,
    private decimal: DecimalPipe,
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
        roundHalf.score.reduce((p, c) => p + c) -
          this.roundVarietyScores
            .transform(
              courseMap.get(roundHalf.courseId)?.par,
              roundHalf.frontOrBack,
            )
            .reduce((p, c) => p + c),
      );
    }
    const toPar =
      scoresToPar.reduce((prev, curr) => prev + curr) /
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
})
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
  if (rounds?.length) {
    for (let index = 0; index < rounds.length; index++) {
      const round = rounds[index];
      const frontNine = round?.strokes?.slice(0, 9);
      const backNine = round?.strokes?.slice(9, 18);
      const countFrontNine = !frontNine?.some((stroke) => !stroke);
      const countBackNine = !backNine?.some((stroke) => !stroke);

      if (eighteenHolesOnly === 18 && (!countFrontNine || !countBackNine)) {
        continue;
      }

      if (countFrontNine) {
        toCount.push({
          score: frontNine,
          courseId: round.courseId,
          frontOrBack: RoundVariety.FRONT_NINE,
        });
      }
      if (countBackNine) {
        toCount.push({
          score: backNine,
          courseId: round.courseId,
          frontOrBack: RoundVariety.BACK_NINE,
        });
      }
    }
  }

  return toCount;
}
