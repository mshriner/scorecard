import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mocked } from 'vitest';
import { COURSE_EXAMPLE } from '../../models/course';
import { BestRound, ROUND_EXAMPLE } from '../../models/round';
import { LocalStorageService } from '../../services/local-storage.service';
import { TEST_LOCAL_STORAGE_SERVICE_MOCK } from '../../services/local-storage.service.spec';
import { BestRoundDialogComponent } from './best-round-dialog.component';

describe('BestRoundDialogComponent', () => {
  let component: BestRoundDialogComponent;
  let fixture: ComponentFixture<BestRoundDialogComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = TEST_LOCAL_STORAGE_SERVICE_MOCK;
    const bestRound: BestRound = {
      strokes: ROUND_EXAMPLE.strokes,
      roundVariety: ROUND_EXAMPLE.roundVariety,
      course: COURSE_EXAMPLE,
      bestScoresRecordedDateISO: Array(18).fill(new Date().toISOString()),
    };
    await TestBed.configureTestingModule({
      imports: [BestRoundDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: bestRound,
        },
        {
          provide: LocalStorageService,
          useValue: localStorageService,
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
