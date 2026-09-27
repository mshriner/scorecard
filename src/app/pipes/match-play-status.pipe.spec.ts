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

  it('returns AS when the match is tied and some holes are not played', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 0],
          [5, 4, 4, 0],
          [-1, 0, 1, 0],
          RoundVariety.FULL_NINE,
        ),
      ),
    ).toBe('AS');
  });

  it('returns 1/2-1/2 when the match is tied and all holes are played, FULL_NINE', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 4, 5, 3, 4, 5, 3],
          [5, 4, 4, 5, 4, 4, 5, 4, 4],
          [-1, 0, 1, -1, 0, 1, -1, 0, 1],
          RoundVariety.FULL_NINE,
        ),
      ),
    ).toBe('½-½');
  });

  it('returns 1/2-1/2 when the match is tied and all holes are played, FRONT_NINE', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 4, 5, 3, 4, 5, 3],
          [5, 4, 4, 5, 4, 4, 5, 4, 4],
          [-1, 0, 1, -1, 0, 1, -1, 0, 1],
          RoundVariety.FRONT_NINE,
        ),
      ),
    ).toBe('½-½');
  });

  it('returns 1/2-1/2 when the match is tied and all holes are played, BACK_NINE', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 4, 5, 3, 4, 5, 3],
          [5, 4, 4, 5, 4, 4, 5, 4, 4],
          [-1, 0, 1, -1, 0, 1, -1, 0, 1],
          RoundVariety.BACK_NINE,
        ),
      ),
    ).toBe('½-½');
  });

  it('returns AS when the match is tied and some holes are not played, EIGHTEEN', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 4, 5, 3, 4, 5, 3],
          [5, 4, 4, 5, 4, 4, 5, 4, 4],
          [-1, 0, 1, -1, 0, 1, -1, 0, 1],
          RoundVariety.EIGHTEEN,
        ),
      ),
    ).toBe('AS');
  });

  it('returns 1/2-1/2 when the match is tied and all holes are played, EIGHTEEN', () => {
    expect(
      pipe.transform(
        createRound(
          [4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3],
          [5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4],
          [-1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1],
          RoundVariety.EIGHTEEN,
        ),
      ),
    ).toBe('½-½');
  });

  it('returns UP when the player leads', () => {
    expect(
      pipe.transform(createRound([3], [4], [0], RoundVariety.FULL_NINE)),
    ).toBe('1 UP');
  });

  it('returns DN when the opponent leads', () => {
    expect(
      pipe.transform(createRound([5], [4], [0], RoundVariety.FULL_NINE)),
    ).toBe('1 DN');
  });
});

function createRound(
  strokes: number[],
  opponentStrokes: number[],
  opponentAdvantage: number[],
  roundVariety: RoundVariety = RoundVariety.EIGHTEEN,
): Round {
  return {
    id: 'round',
    dateStringISO: '',
    courseId: 'course',
    strokes: strokes as NineNumbersOrNulls,
    putts: [null, null, null, null, null, null, null, null, null],
    roundVariety: roundVariety,
    generalNotes: '',
    matchPlay: {
      opponentStrokes: opponentStrokes as NineNumbersOrNulls,
      opponentAdvantage: opponentAdvantage as NineNumbersOrNulls,
      isMatchPlay: true,
    },
  };
}
