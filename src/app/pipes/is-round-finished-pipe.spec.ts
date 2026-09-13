import { IsRoundFinishedPipe } from './is-round-finished-pipe';

describe('IsRoundFinishedPipe', () => {
  const pipe = new IsRoundFinishedPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it.each([0, 44, '44'])('returns true for a finished round: %s', (score) => {
    expect(pipe.transform(score)).toBe(true);
  });

  it.each(['Thru 0', 'thru 9', 'THRU 18', 'Score THRU 9'])(
    'returns false for an unfinished round: %s',
    (score) => {
      expect(pipe.transform(score)).toBe(false);
    },
  );
});
