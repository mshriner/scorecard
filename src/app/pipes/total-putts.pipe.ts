import { Pipe, PipeTransform } from '@angular/core';
import { Round, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'totalPutts',
  pure: false,
})
export class TotalPuttsPipe implements PipeTransform {
  constructor(private roundVarietyScores: RoundVarietyScoresPipe) {}

  transform(round: Round, half?: RoundVariety): number {
    return this.roundVarietyScores
      .transform(round.putts, half || round.roundVariety)
      .reduce((prev, curr) => (prev || 0) + (curr || 0));
  }
}
