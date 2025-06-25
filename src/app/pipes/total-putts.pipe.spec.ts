import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { TotalPuttsPipe } from './total-putts.pipe';

describe('TotalPuttsPipe', () => {
  let component: TotalPuttsPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        TotalPuttsPipe,
        RoundVarietyScoresPipe,
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    component = TestBed.inject(TotalPuttsPipe);
  });

  it('create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate putts score', () => {
    const round: any = {
      putts: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      roundVariety: RoundVariety.FULL_NINE,
    };
    const result = component.transform(round);
    expect(result).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9);
  });

  it('should sum up putts correctly', () => {
    const round: any = {
      putts: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      roundVariety: RoundVariety.FULL_NINE,
    };
    const result = component.transform(round);
    expect(result).toBe(45);
  });

  it('should handle null and undefined values in putts', () => {
    const round: any = {
      putts: [1, null, 2, undefined, 3],
      roundVariety: RoundVariety.FULL_NINE,
    };
    const result = component.transform(round);
    expect(result).toBe(6);
  });

  it('should return 0 if transform is passed an empty array', () => {
    const round: any = { putts: [], roundVariety: RoundVariety.FULL_NINE };
    const result = component.transform(round);
    expect(result).toBe(0);
  });

  it('should use provided half if given', () => {
    const round: any = {
      putts: [2, 2, 2],
      roundVariety: RoundVariety.EIGHTEEN,
    };
    const result = component.transform(round, RoundVariety.FRONT_NINE);
    expect(result).toBe(6);
  });

  it('should handle all nulls', () => {
    const round: any = {
      putts: [null, null, null],
      roundVariety: RoundVariety.FULL_NINE,
    };
    const result = component.transform(round);
    expect(result).toBe(0);
  });
});
