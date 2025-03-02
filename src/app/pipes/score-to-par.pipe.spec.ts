import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { ScoreToParPipe } from './score-to-par.pipe';

describe('ScoreToParPipe', () => {
  let component: ScoreToParPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ScoreToParPipe,
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    component = TestBed.inject(ScoreToParPipe);
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
