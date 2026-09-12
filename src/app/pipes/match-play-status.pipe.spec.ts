import { TestBed } from '@angular/core/testing';
import { Round, RoundVariety } from '../models/round';
import { NineNumbersOrNulls } from '../models/storage-object';
import { MatchPlayStatusPipe } from './match-play-status.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

describe('MatchPlayStatusPipe', () => {
  let pipe: MatchPlayStatusPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoundVarietyScoresPipe, MatchPlayStatusPipe],
    });
    pipe = TestBed.inject(MatchPlayStatusPipe);
  });

  it('creates an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns AS when the match is tied', () => {
    expect(pipe.transform(createRound([4, 5, 3], [5, 4, 4], [-1, 0, 1]))).toBe(
      'AS',
    );
  });

  it('returns UP when the player leads', () => {
    expect(pipe.transform(createRound([3], [4], [0]))).toBe('1 UP');
  });

  it('returns DN when the opponent leads', () => {
    expect(pipe.transform(createRound([5], [4], [0]))).toBe('1 DN');
  });
});

function createRound(
  strokes: number[],
  opponentStrokes: number[],
  opponentAdvantage: number[],
): Round {
  return {
    id: 'round',
    dateStringISO: '',
    courseId: 'course',
    strokes: strokes as NineNumbersOrNulls,
    putts: [null, null, null, null, null, null, null, null, null],
    roundVariety: RoundVariety.EIGHTEEN,
    generalNotes: '',
    matchPlay: {
      opponentStrokes: opponentStrokes as NineNumbersOrNulls,
      opponentAdvantage: opponentAdvantage as NineNumbersOrNulls,
      isMatchPlay: true,
    },
  };
}
