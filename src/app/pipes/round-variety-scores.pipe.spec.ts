import { RoundVariety } from '../models/round';
import {
  EighteenNumbersOrNulls,
  NineNumbersOrNulls,
} from '../models/storage-object';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

describe('RoundVarietyScoresPipe', () => {
  it('create an instance', () => {
    const pipe = new RoundVarietyScoresPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return first 9 scores for FRONT_NINE', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: EighteenNumbersOrNulls = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, RoundVariety.FRONT_NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return first 9 scores for FRONT_NINE, only nine provided', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: NineNumbersOrNulls = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = pipe.transform(input, RoundVariety.FRONT_NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return first 9 scores for FULL_NINE', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: EighteenNumbersOrNulls = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, RoundVariety.FULL_NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return first 9 scores for FULL_NINE, only nine provided', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: NineNumbersOrNulls = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = pipe.transform(input, RoundVariety.FULL_NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return last 9 scores for BACK_NINE', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: EighteenNumbersOrNulls = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, RoundVariety.BACK_NINE);
    expect(result).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18]);
  });

  it('should return all 18 scores for EIGHTEEN', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: EighteenNumbersOrNulls = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, RoundVariety.EIGHTEEN);
    expect(result).toEqual(input);
  });

  it('should return 18 scores for EIGHTEEN when only nine provided', () => {
    const pipe = new RoundVarietyScoresPipe();
    const input: NineNumbersOrNulls = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const output: EighteenNumbersOrNulls = [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    const result = pipe.transform(input, RoundVariety.EIGHTEEN);
    expect(result).toEqual(output);
  });

  it('should return default EMPTY_NINE_NUMBERS for undefined strokes and FRONT_NINE', () => {
    const pipe = new RoundVarietyScoresPipe();
    const result = pipe.transform(undefined, RoundVariety.FRONT_NINE);
    expect(result.length).toBe(9);
    expect(result.every((x) => x === null)).toBeTrue();
  });

  it('should return default EMPTY_EIGHTEEN_NUMBERS for undefined strokes and EIGHTEEN', () => {
    const pipe = new RoundVarietyScoresPipe();
    const result = pipe.transform(undefined, RoundVariety.EIGHTEEN);
    expect(result.length).toBe(18);
    expect(result.every((x) => x === null)).toBeTrue();
  });
});
