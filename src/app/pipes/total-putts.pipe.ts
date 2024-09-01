import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/round';

@Pipe({
  name: 'totalPutts',
  standalone: true,
  pure: false
})
export class TotalPuttsPipe implements PipeTransform {

  transform(round: Round): number {
    return round.putts.reduce((prev, curr) => (prev || 0) + (curr || 0));
  }
}
