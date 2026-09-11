import { FormatThruPipe } from './format-thru-pipe';

describe('FormatThruPipe', () => {
  const pipe = new FormatThruPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats thru case insensitively as small uppercase html', () => {
    expect(pipe.transform('Thru 3')).toBe(
      '<span class="thru-label">THRU</span> 3',
    );
    expect(pipe.transform('tHRU 4')).toBe(
      '<span class="thru-label">THRU</span> 4',
    );
  });

  it('returns values without thru unchanged', () => {
    expect(pipe.transform('72')).toBe('72');
    expect(pipe.transform(72)).toBe(72);
  });
});
