import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUND_MINIMUM_PROPERTIES_EXAMPLE, Round } from '../../models/round';
import { MatchPlayOpponentStrokesDialogComponent } from './match-play-opponent-strokes-dialog.component';

describe('MatchPlayOpponentStrokesDialogComponent', () => {
  let component: MatchPlayOpponentStrokesDialogComponent;
  let fixture: ComponentFixture<MatchPlayOpponentStrokesDialogComponent>;

  beforeEach(async () => {
    const round: Round = {
      ...ROUND_MINIMUM_PROPERTIES_EXAMPLE,
      matchPlay: {
        opponentName: 'Alex',
        opponentAdvantage: Array.from({ length: 18 }, () => 0) as any,
        showOpponentScores: true,
      },
    };
    await TestBed.configureTestingModule({
      imports: [MatchPlayOpponentStrokesDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: round,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchPlayOpponentStrokesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save opponent settings and close with the edited match play data', () => {
    component.opponentName = 'Riley';
    component.userHandicapIsHigher.set(true); // Set user handicap higher than opponent
    component.toggleHole(0); // Create opponent stroke on hole 0 (value should be -1 when handicapIsHigher is false)
    component.toggleHole(1); // Create my stroke on hole 1
    component.incrementHole(1); // Increment to 2 strokes

    component.save();

    expect(component.dialogRef.close).toHaveBeenCalledWith({
      opponentName: 'Riley',
      opponentAdvantage: expect.arrayContaining([-1, -2, ...Array(16).fill(0)]),
      showOpponentScores: true,
    });
  });
});
