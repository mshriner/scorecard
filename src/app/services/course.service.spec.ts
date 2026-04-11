import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { Mocked } from 'vitest';
import { TEST_LOCAL_STORAGE_SERVICE_MOCK } from '../services/local-storage.service.spec';
import { CourseService } from './course.service';
import { LocalStorageService } from './local-storage.service';

describe('CourseService', () => {
  let service: CourseService;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = TEST_LOCAL_STORAGE_SERVICE_MOCK;
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();
    service = TestBed.inject(CourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
