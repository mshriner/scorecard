import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { Mocked } from 'vitest';
import { LocalStorageService } from './local-storage.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as unknown as Mocked<LocalStorageService>;
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
