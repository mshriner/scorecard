import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { TotalRoundScorePipe } from './total-round-score.pipe';

describe('TotalRoundScorePipe', () => {
  let component: TotalRoundScorePipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        TotalRoundScorePipe,
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    component = TestBed.inject(TotalRoundScorePipe);
  });

  it('create an instance', async () => {
    expect(component).toBeTruthy();
  });

  it('should calculate round score', () => {
    const roundVarietyScoresPipeSpy = spyOn(
      roundVarietyScoresPipe,
      'transform',
    ).and.returnValue([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
