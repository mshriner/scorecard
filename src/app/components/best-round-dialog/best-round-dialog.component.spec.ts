import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COURSE_EXAMPLE } from '../../models/course';
import { BestRound, ROUND_EXAMPLE } from '../../models/round';
import { BestRoundDialogComponent } from './best-round-dialog.component';

describe('BestRoundDialogComponent', () => {
  let component: BestRoundDialogComponent;
  let fixture: ComponentFixture<BestRoundDialogComponent>;

  beforeEach(async () => {
    const bestRound: BestRound = {
      strokes: ROUND_EXAMPLE.strokes,
      roundVariety: ROUND_EXAMPLE.roundVariety,
      course: COURSE_EXAMPLE,
      bestScoresRecordedDateISO: Array(18).fill(new Date().toISOString()),
    };
    await TestBed.configureTestingModule({
      imports: [BestRoundDialogComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: bestRound,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BestRoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
