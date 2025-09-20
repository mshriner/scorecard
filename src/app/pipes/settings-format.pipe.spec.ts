import { FormatAppThemePipe, FormatTextSizePipe } from './settings-format.pipe';

describe('FormatTextSizePipe', () => {
  it('create an instance', () => {
    const pipe = new FormatTextSizePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('FormatAppThemePipe', () => {
  it('create an instance', () => {
    const pipe = new FormatAppThemePipe();
    expect(pipe).toBeTruthy();
  });
});
