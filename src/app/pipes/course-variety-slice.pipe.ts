import { Pipe, PipeTransform } from '@angular/core';
import {
  CourseVariety,
  EIGHTEEN_NUMBERS_ZEROED,
  NINE_NUMBERS_ZEROED,
} from '../models/course';
import { EighteenNumbers, NineNumbers } from '../models/storage-object';

@Pipe({ name: 'courseVarietySlice' })
export class CourseVarietySlicePipe implements PipeTransform {
  transform(
    par: NineNumbers | EighteenNumbers,
    variety: CourseVariety,
  ): NineNumbers | EighteenNumbers {
    switch (variety) {
      case CourseVariety.NINE:
        return (
          (par?.slice(0, 9) as NineNumbers) ||
          structuredClone(NINE_NUMBERS_ZEROED)
        );
      case CourseVariety.EIGHTEEN:
      default:
        return par?.length === 9
          ? [...par, ...structuredClone(NINE_NUMBERS_ZEROED)]
          : par || structuredClone(EIGHTEEN_NUMBERS_ZEROED);
    }
  }
}
