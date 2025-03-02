import { TestBed } from '@angular/core/testing';

import { ImportService } from './import.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    service = TestBed.inject(ImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
