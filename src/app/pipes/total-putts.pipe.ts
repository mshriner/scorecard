import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalPutts',
  pure: false,
})
export class TotalPuttsPipe implements PipeTransform {
  constructor(private roundVarietyScores: RoundVarietyScoresPipe) {}

  transform(round: Round): number {
    return this.roundVarietyScores
      .transform(round.putts, round.roundVariety)
      .reduce((prev, curr) => (prev || 0) + (curr || 0));
  }
}
