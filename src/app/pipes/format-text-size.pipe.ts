import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatTextSize' })
export class FormatTextSizePipe implements PipeTransform {
  transform(value: number | string): string | number {
    switch (value) {
      case 3:
        return 'XL';
      case 2:
        return 'L';
      case 1:
        return 'M';
      case 0:
        return 'S';
      case 'XL':
        return 3;
      case 'L':
        return 2;
      case 'M':
        return 1;
      case 'S':
      default:
        return 0;
    }
  }
}
