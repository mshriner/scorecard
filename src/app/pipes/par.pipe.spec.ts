import { ParPipe } from './par.pipe';

describe('ParPipe', () => {
  it('create an instance', () => {
    const pipe = new ParPipe();
    expect(pipe).toBeTruthy();
  });
});
