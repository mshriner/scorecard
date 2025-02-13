import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TotalRoundScorePipe } from './total-round-score.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { AverageScorePipe } from './average-score.pipe';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('AverageScorePipe', () => {
  let component: AverageScorePipe;
  let fixture: ComponentFixture<AverageScorePipe>;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        RoundVarietyScoresPipe,
        provideExperimentalZonelessChangeDetection(),
      ],
      declarations: [AverageScorePipe],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AverageScorePipe);
    component = fixture.componentInstance;
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
