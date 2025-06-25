import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AreYouSureDialogComponent } from './are-you-sure-dialog.component';

describe('AreYouSureDialogComponent', () => {
  let component: AreYouSureDialogComponent;
  let fixture: ComponentFixture<AreYouSureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreYouSureDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MatDialogRef,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AreYouSureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
