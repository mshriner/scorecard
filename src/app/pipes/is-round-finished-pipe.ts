import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRoundFinished',
})
export class IsRoundFinishedPipe implements PipeTransform {
  transform(value: number | string): boolean {
    if (typeof value !== 'string') {
      return true;
    }
    return !value.match(/thru/gi);
  }
}
