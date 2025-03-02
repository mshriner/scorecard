import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { TotalPuttsPipe } from './total-putts.pipe';

describe('TotalPuttsPipe', () => {
  let component: TotalPuttsPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        TotalPuttsPipe,
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    component = TestBed.inject(TotalPuttsPipe);
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
