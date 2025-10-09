import { Pipe, PipeTransform, inject } from '@angular/core';
import { RoundLike, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalRoundScore',
  pure: false,
})
export class TotalRoundScorePipe implements PipeTransform {
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);

  transform(
    round: RoundLike,
    halfToPreventThruFormat?: RoundVariety,
  ): number | string {
    const validStrokes = this.roundVarietyScores.transform(
      round.strokes,
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
