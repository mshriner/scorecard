import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { AppComponent } from './app.component';
import { LocalStorageService } from './services/local-storage.service';
import { Mocked } from 'vitest';

describe('AppComponent', () => {
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as unknown as Mocked<LocalStorageService>;
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
