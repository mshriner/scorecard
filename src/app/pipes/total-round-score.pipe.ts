import { Pipe, PipeTransform } from '@angular/core';
import { Round, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalRoundScore',
  pure: false,
})
export class TotalRoundScorePipe implements PipeTransform {
  constructor(private roundVarietyScores: RoundVarietyScoresPipe) {}

  transform(round: Round, half?: RoundVariety): string {
    const validStrokes = this.roundVarietyScores.transform(
      round.strokes,
      half || round.roundVariety
    );

    if (!half) {
      const numberOfUncompletedHoles = validStrokes.filter(
        (hole) => (hole || 0) <= 0
      ).length;
      if (numberOfUncompletedHoles) {
        return `Thru ${
          round.roundVariety != RoundVariety.EIGHTEEN
          ? 9 - numberOfUncompletedHoles
          : 18 - numberOfUncompletedHoles
          }`;
        }
      }

    return `${validStrokes.reduce((prev, curr) => prev + curr)}`;
  }
}
