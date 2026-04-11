import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { Mocked } from 'vitest';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

describe('AppStateService', () => {
  let service: AppStateService;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as unknown as Mocked<LocalStorageService>;
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    });
    service = TestBed.inject(AppStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
