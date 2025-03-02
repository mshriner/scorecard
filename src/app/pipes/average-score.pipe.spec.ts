import { DecimalPipe } from '@angular/common';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RoundVariety } from '../models/round';
import {
  AverageScorePipe,
  AverageScoreToParPipe,
  CountValidRoundsToAveragePipe,
} from './average-score.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

describe('AverageScorePipe', () => {
  let averageScorePipe: AverageScorePipe;
  let averageScoreToParPipe: AverageScoreToParPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;
  let countValidRoundsPipe: CountValidRoundsToAveragePipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        AverageScorePipe,
        AverageScoreToParPipe,
        CountValidRoundsToAveragePipe,
        DecimalPipe,
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    averageScorePipe = TestBed.inject(AverageScorePipe);
    averageScoreToParPipe = TestBed.inject(AverageScoreToParPipe);
    countValidRoundsPipe = TestBed.inject(CountValidRoundsToAveragePipe);
  });

  it('create an instance', () => {
    expect(averageScorePipe).toBeTruthy();
    expect(averageScoreToParPipe).toBeTruthy();
    expect(countValidRoundsPipe).toBeTruthy();
  });

  it('should calculate round score', () => {
    expect(averageScorePipe.transform([], 9)).toBe('--');
    expect(averageScoreToParPipe.transform([], new Map(), 9)).toBe('--');
    expect(
      countValidRoundsPipe.transform(
        [
          {
            strokes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
        ],
        9,
      ),
    ).toBe(0);
  });
});
