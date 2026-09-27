import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatThru',
})
export class FormatThruPipe implements PipeTransform {
  transform(value: number | string): number | string {
    if (typeof value !== 'string') {
      return value;
    }

    return value.replace(/thru/gi, '<span class="thru-label">THRU</span>');
  }
}
