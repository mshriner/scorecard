import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { RoundService } from './round.service';

describe('RoundService', () => {
  let service: RoundService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(RoundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
