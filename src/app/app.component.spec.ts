import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Mocked } from 'vitest';
import { AppComponent } from './app.component';
import { LocalStorageService } from './services/local-storage.service';
import { TEST_LOCAL_STORAGE_SERVICE_MOCK } from './services/local-storage.service.spec';

describe('AppComponent', () => {
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = TEST_LOCAL_STORAGE_SERVICE_MOCK;
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: {} },
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
