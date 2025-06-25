import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ParPipe } from './par.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

describe('ParPipe', () => {
  let component: ParPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ParPipe,
        RoundVarietyScoresPipe,
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    component = TestBed.inject(ParPipe);
  });

  it('create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate round score', () => {
    const roundVarietyScoresPipeSpy = spyOn(
      roundVarietyScoresPipe,
      'transform',
    ).and.returnValue([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
