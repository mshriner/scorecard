import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createEmptyHoleResults } from '../../models/graph';
import { StatsComponent } from './stats.component';

describe('HomeStatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsComponent, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('filteredRounds', []);
    fixture.componentRef.setInput('courseMap', new Map());
    fixture.componentRef.setInput('holeResultTotals', createEmptyHoleResults());
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });
});
