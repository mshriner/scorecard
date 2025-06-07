import { Pipe, PipeTransform } from '@angular/core';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  EMPTY_NINE_NUMBERS,
  RoundVariety,
} from '../models/round';
import {
  EighteenNumbersOrNulls,
  NineNumbersOrNulls,
} from '../models/storage-object';

@Pipe({ name: 'roundVarietyScores' })
export class RoundVarietyScoresPipe implements PipeTransform {
  transform(
    strokes?: NineNumbersOrNulls | EighteenNumbersOrNulls,
    variety?: RoundVariety,
  ): NineNumbersOrNulls | EighteenNumbersOrNulls {
    switch (variety) {
      case RoundVariety.FRONT_NINE:
      case RoundVariety.FULL_NINE:
        return (
          (strokes?.slice(0, 9) as NineNumbersOrNulls) ||
          structuredClone(EMPTY_NINE_NUMBERS)
        );
      case RoundVariety.BACK_NINE:
        return (
          (strokes?.slice(9) as NineNumbersOrNulls) ||
          structuredClone(EMPTY_NINE_NUMBERS)
        );
      case RoundVariety.EIGHTEEN:
      default:
        return strokes?.length === 9
          ? [...strokes, ...structuredClone(EMPTY_NINE_NUMBERS)]
          : strokes || structuredClone(EMPTY_EIGHTEEN_NUMBERS);
    }
  }
}
