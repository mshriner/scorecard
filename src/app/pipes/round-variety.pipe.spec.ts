import { RoundVariety } from '../models/round';
import { RoundVarietyPipe } from './round-variety.pipe';

describe('RoundVarietyPipe', () => {
  it('create an instance', () => {
    const pipe = new RoundVarietyPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return formatted values', () => {
    const pipe = new RoundVarietyPipe();
    expect(pipe.transform(RoundVariety.FRONT_NINE)).toEqual(
      'Front nine (9 holes)',
    );
    expect(pipe.transform(RoundVariety.BACK_NINE)).toEqual(
      'Back nine (9 holes)',
    );
    expect(pipe.transform(RoundVariety.FULL_NINE)).toEqual(
      'Full round (9 holes)',
    );
    expect(pipe.transform(RoundVariety.EIGHTEEN)).toEqual(
      'Full round (18 holes)',
    );
  });
});
