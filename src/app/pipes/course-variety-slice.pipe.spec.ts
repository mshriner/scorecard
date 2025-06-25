import { CourseVariety } from '../models/course';
import { EighteenNumbers, NineNumbers } from '../models/storage-object';
import { CourseVarietySlicePipe } from './course-variety-slice.pipe';

describe('CourseVarietySlicePipe', () => {
  it('create an instance', () => {
    const pipe = new CourseVarietySlicePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return first 9 pars for NINE', () => {
    const pipe = new CourseVarietySlicePipe();
    const input: EighteenNumbers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, CourseVariety.NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return first 9 pars for NINE, only nine provided', () => {
    const pipe = new CourseVarietySlicePipe();
    const input: NineNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = pipe.transform(input, CourseVariety.NINE);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should return all 18 pars for EIGHTEEN', () => {
    const pipe = new CourseVarietySlicePipe();
    const input: EighteenNumbers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ];
    const result = pipe.transform(input, CourseVariety.EIGHTEEN);
    expect(result).toEqual(input);
  });

  it('should return 18 pars for EIGHTEEN when only nine provided', () => {
    const pipe = new CourseVarietySlicePipe();
    const input: NineNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const output: EighteenNumbers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    const result = pipe.transform(input, CourseVariety.EIGHTEEN);
    expect(result).toEqual(output);
  });
});
