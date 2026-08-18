import { Pipe, PipeTransform, inject } from '@angular/core';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  RoundLike,
  RoundVariety,
} from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalRoundScore',
  pure: false,
})
export class TotalRoundScorePipe implements PipeTransform {
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);

  /**
   * Calculates the total score for the provided round.
   *
   * If a half round variety is not provided, this pipe returns a "Thru X"
   * string when the round is not yet complete. Once all holes are completed,
   * it returns the total stroke count.
   *
   * @param round The round data containing strokes and variety.
   * @param halfToPreventThruFormat Optional variety used for calculating
   *   half-round scores while avoiding the incomplete round formatting.
   * @returns The round total score or a progress string if the round is incomplete.
   */
  transform(
    round: RoundLike,
    halfToPreventThruFormat?: RoundVariety,
    opponentScore?: boolean,
  ): number | string {
    const validStrokes = this.roundVarietyScores.transform(
      opponentScore
        ? round.matchPlay?.opponentStrokes || EMPTY_EIGHTEEN_NUMBERS
        : round.strokes,
      halfToPreventThruFormat ?? round.roundVariety,
    );

    if (!halfToPreventThruFormat) {
      const numberOfCompletedHoles = validStrokes.filter(
        (hole) => (hole ?? 0) > 0,
      ).length;
      let numberOfHolesNeededForCompletion =
        round.roundVariety === RoundVariety.EIGHTEEN ? 18 : 9;

      if (numberOfCompletedHoles !== numberOfHolesNeededForCompletion) {
        return `Thru ${numberOfCompletedHoles}`;
      }
    }

    return (
      validStrokes.reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0) ?? 0
    );
  }
}
