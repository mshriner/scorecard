import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalRoundScore',
  pure: false,
})
export class TotalRoundScorePipe implements PipeTransform {
  constructor(private roundVarietyScores: RoundVarietyScoresPipe) {}

  transform(round: Round): number {
    return this.roundVarietyScores
      .transform(round.strokes, round.roundVariety)
      .reduce((prev, curr) => prev + curr);
  }
}
