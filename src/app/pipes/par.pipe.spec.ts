import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TotalRoundScorePipe } from './total-round-score.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { ParPipe } from './par.pipe';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ParPipe', () => {
  let component: ParPipe;
  let fixture: ComponentFixture<ParPipe>;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [RoundVarietyScoresPipe,provideExperimentalZonelessChangeDetection()],
      declarations: [ParPipe],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParPipe);
    component = fixture.componentInstance;
  });

  it('create an instance', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should calculate round score', fakeAsync(() => {
    const roundVarietyScoresPipeSpy = spyOn(
      roundVarietyScoresPipe,
      'transform',
    ).and.returnValue([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }));
});
