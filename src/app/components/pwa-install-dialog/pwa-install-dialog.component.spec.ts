import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { PwaInstallDialogComponent } from './pwa-install-dialog.component';

describe('PwaInstallDialogComponent', () => {
  let component: PwaInstallDialogComponent;
  let fixture: ComponentFixture<PwaInstallDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PwaInstallDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PwaInstallDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
