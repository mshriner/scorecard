import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Mocked } from 'vitest';
import { LocalStorageService } from '../../services/local-storage.service';
import { PwaInstallDialogComponent } from './pwa-install-dialog.component';

describe('PwaInstallDialogComponent', () => {
  let component: PwaInstallDialogComponent;
  let fixture: ComponentFixture<PwaInstallDialogComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as unknown as Mocked<LocalStorageService>;
    await TestBed.configureTestingModule({
      imports: [PwaInstallDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
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
