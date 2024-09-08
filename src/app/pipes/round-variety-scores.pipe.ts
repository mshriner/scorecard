import { Pipe, PipeTransform } from '@angular/core';
import { RoundVariety } from '../models/round';

@Pipe({
  name: 'roundVarietyScores',
})
export class RoundVarietyScoresPipe implements PipeTransform {

  transform(strokes: number[], variety?: RoundVariety): number[] {
    switch (variety) {
      case RoundVariety.FRONT_NINE:
        return strokes?.slice(0, 9) || [];
      case RoundVariety.BACK_NINE:
        return strokes?.slice(9) || [];
      case RoundVariety.EIGHTEEN:
      default:
        return strokes || [];
    }
  }

}
