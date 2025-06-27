import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  EMPTY_NINE_NUMBERS,
  Round,
  RoundVariety,
} from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { TotalRoundScorePipe } from './total-round-score.pipe';

describe('TotalRoundScorePipe', () => {
  let component: TotalRoundScorePipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        TotalRoundScorePipe,
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();
    component = TestBed.inject(TotalRoundScorePipe);
  });

  it('create an instance', async () => {
    expect(component).toBeTruthy();
  });

  it('should sum all strokes for FULL_NINE', () => {
    const round: Round = {
      id: '1',
      dateStringISO: '',
      courseId: '',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: EMPTY_NINE_NUMBERS,
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.transform(round)).toBe(45);
  });

  it('should sum all strokes for EIGHTEEN', () => {
    const round: Round = {
      id: '2',
      dateStringISO: '',
      courseId: '',
      strokes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      putts: EMPTY_EIGHTEEN_NUMBERS,
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
    };
    expect(component.transform(round)).toBe(18);
  });

  it('should handle null and undefined values in strokes', () => {
    const round: any = {
      id: '3',
      dateStringISO: '',
      courseId: '',
      strokes: [1, null, 2, undefined, 3],
      putts: [],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.transform(round)).toBe('Thru 3');
  });

  it('should return Thru 0 if strokes is empty', () => {
    const round: any = {
      id: '4',
      dateStringISO: '',
      courseId: '',
      strokes: [],
      putts: [],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.transform(round)).toBe('Thru 0');
  });

  it('should return 0 if strokes is empty, arg passed', () => {
    const round: any = {
      id: '4',
      dateStringISO: '',
      courseId: '',
      strokes: [],
      putts: [],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.transform(round, RoundVariety.FULL_NINE)).toBe(0);
  });

  it('should return "Thru X" if not all holes are completed (EIGHTEEN)', () => {
    const round: Round = {
      id: '5',
      dateStringISO: '',
      courseId: '',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 0, 0, 0],
      putts: EMPTY_EIGHTEEN_NUMBERS,
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
    };
    // 4 uncompleted holes, so "Thru 14"
    expect(component.transform(round)).toBe('Thru 14');
  });

  it('should return "Thru X" if not all holes are completed (FULL_NINE)', () => {
    const round: Round = {
      id: '6',
      dateStringISO: '',
      courseId: '',
      strokes: [1, 2, 3, 0, 0, 0, 0, 0, 0],
      putts: EMPTY_NINE_NUMBERS,
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    // 6 uncompleted holes, so "Thru 3"
    expect(component.transform(round)).toBe('Thru 3');
  });

  it('should sum only the selected half if half is provided', () => {
    const round: Round = {
      id: '7',
      dateStringISO: '',
      courseId: '',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      putts: EMPTY_EIGHTEEN_NUMBERS,
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
    };
    // FRONT_NINE: sum of first 9
    expect(component.transform(round, RoundVariety.FRONT_NINE)).toBe(45);
    // BACK_NINE: sum of last 9
    expect(component.transform(round, RoundVariety.BACK_NINE)).toBe(126);
  });

  it('should return 0 if all strokes are null or zero', () => {
    const round: Round = {
      id: '8',
      dateStringISO: '',
      courseId: '',
      strokes: [null, null, null, 0, 0, 0, null, null, null],
      putts: EMPTY_NINE_NUMBERS,
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.transform(round)).toBe('Thru 0');
  });
});
