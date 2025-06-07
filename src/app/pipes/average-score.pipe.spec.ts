import { DecimalPipe } from '@angular/common';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CourseVariety } from '../models/course';
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

    averageScorePipe = TestBed.inject(AverageScorePipe);
    averageScoreToParPipe = TestBed.inject(AverageScoreToParPipe);
    countValidRoundsPipe = TestBed.inject(CountValidRoundsToAveragePipe);
  });

  it('create an instance', () => {
    expect(averageScorePipe).toBeTruthy();
    expect(averageScoreToParPipe).toBeTruthy();
    expect(countValidRoundsPipe).toBeTruthy();
  });

  it('should calculate average round score', () => {
    expect(averageScorePipe.transform([], 9)).toBe('--');
  });

  it('should calculate average round score and return 0 - nontrivial', () => {
    expect(
      averageScorePipe.transform(
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
    ).toBe('--');
  });

  it('should calculate average round score and return "--" for empty rounds', () => {
    expect(averageScorePipe.transform([], 18)).toBe('--');
  });

  it('should calculate average round score and return correct value for mixed valid and invalid rounds', () => {
    expect(
      averageScorePipe.transform(
        [
          {
            strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
          {
            strokes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            courseId: '2',
            dateStringISO: '2021-01-02T00:00:00.000Z',
            id: '2',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.BACK_NINE,
            generalNotes: '',
          },
        ],
        9,
      ),
    ).toBe('36');
  });

  it('should calculate average round score and return correct value for full 18-hole rounds', () => {
    expect(
      averageScorePipe.transform(
        [
          {
            strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
        ],
        18,
      ),
    ).toBe('72');
  });

  it('should calculate average round score to par and return "E" for even par', () => {
    expect(
      averageScoreToParPipe.transform(
        [
          {
            strokes: [3, 3, 3, 3, 3, 3, 3, 3, 3],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
        ],
        new Map([
          [
            '1',
            {
              courseId: '1',
              id: '1',
              name: '',
              numberOfHoles: CourseVariety.NINE,
              courseName: 'Test Course',
              par: [3, 3, 3, 3, 3, 3, 3, 3, 3],
            },
          ],
        ]),
        9,
      ),
    ).toBe('E');
  });

  it('should calculate average round score to par and return "+1.0" for over par', () => {
    expect(
      averageScoreToParPipe.transform(
        [
          {
            strokes: [3, 3, 3, 3, 3, 3, 4, 4, 4],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
        ],
        new Map([
          [
            '1',
            {
              courseId: '1',
              id: '1',
              name: '',
              numberOfHoles: CourseVariety.NINE,
              courseName: 'Test Course',
              par: [3, 3, 3, 3, 3, 3, 3, 3, 3],
            },
          ],
        ]),
        9,
      ),
    ).toBe('+3');
  });

  it('should calculate average round score to par and return "-1.0" for under par', () => {
    expect(
      averageScoreToParPipe.transform(
        [
          {
            strokes: [3, 3, 3, 3, 3, 3, 2, 2, 2],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
        ],
        new Map([
          [
            '1',
            {
              courseId: '1',
              id: '1',
              name: '',
              numberOfHoles: CourseVariety.NINE,
              courseName: 'Test Course',
              par: [3, 3, 3, 3, 3, 3, 3, 3, 3],
            },
          ],
        ]),
        9,
      ),
    ).toBe('-3');
  });

  it('should count valid rounds and return 0 for no valid rounds', () => {
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

  it('should count valid rounds and return correct count for mixed valid and invalid rounds', () => {
    expect(
      countValidRoundsPipe.transform(
        [
          {
            strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
            courseId: '1',
            dateStringISO: '2021-01-01T00:00:00.000Z',
            id: '1',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.FRONT_NINE,
            generalNotes: '',
          },
          {
            strokes: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            courseId: '2',
            dateStringISO: '2021-01-02T00:00:00.000Z',
            id: '2',
            putts: [null, null, null, null, null, null, null, null, null],
            roundVariety: RoundVariety.BACK_NINE,
            generalNotes: '',
          },
        ],
        9,
      ),
    ).toBe(1);
  });

  it('should count valid rounds and return 1 - nontrivial', () => {
    expect(
      countValidRoundsPipe.transform(
        [
          {
            strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
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
    ).toBe(1);
  });

  it('should count valid rounds and return 2 - full 18', () => {
    expect(
      countValidRoundsPipe.transform(
        [
          {
            strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
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
    ).toBe(2);
  });
});
