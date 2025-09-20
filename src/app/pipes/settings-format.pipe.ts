import { Pipe, PipeTransform } from '@angular/core';
import { AppTheme } from '../models/user';

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

@Pipe({ name: 'formatAppTheme' })
export class FormatAppThemePipe implements PipeTransform {
  transform(value?: AppTheme, short?: 'short'): string {
    switch (value) {
      case AppTheme.LIGHT:
        return short ? 'Light' : 'Light Mode';
      case AppTheme.DARK:
        return short ? 'Dark' : 'Dark Mode';
      case AppTheme.SYSTEM:
      default:
        return short ? 'Sys' : 'System Theme';
    }
  }
}
