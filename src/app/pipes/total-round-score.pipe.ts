import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/round';

@Pipe({
  name: 'totalRoundScore',
  standalone: true,
  pure: false
})
export class TotalRoundScorePipe implements PipeTransform {

  transform(round: Round): number {
    return round.strokes.reduce((prev, curr) => prev + curr);
  }

}
