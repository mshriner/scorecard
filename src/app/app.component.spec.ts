import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { EMPTY } from 'rxjs';
import { Mocked } from 'vitest';
import { AppComponent } from './app.component';
import { APP_ROUTES } from './models/constants';
import { LocalStorageService } from './services/local-storage.service';
import { createLocalStorageServiceTestMock } from './services/local-storage.service.spec';
import { NavigationMessageService } from './services/navigation-message.service';
import { SnackBarService } from './services/snack-bar.service';

describe('AppComponent', () => {
  let localStorageService: Mocked<LocalStorageService>;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let openTemporarySnackBar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    localStorageService = createLocalStorageServiceTestMock();
    navigateByUrl = vi.fn().mockResolvedValue(true);
    openTemporarySnackBar = vi.fn();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: {} },
        {
          provide: NavigationMessageService,
          useValue: { navigateByUrl, events: EMPTY },
        },
        {
          provide: SnackBarService,
          useValue: { openTemporarySnackBar },
        },
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

  it('shows a message when navigation is cancelled', async () => {
    navigateByUrl.mockResolvedValue(false);
    const app = TestBed.createComponent(AppComponent).componentInstance;

    await app.goToHome();

    expect(navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.HOME);
    expect(openTemporarySnackBar).toHaveBeenCalledWith(
      'Unable to navigate. Please try again.',
    );
  });

  it('shows a message when navigation rejects', async () => {
    const error = new Error('Router failure');
    navigateByUrl.mockRejectedValue(error);
    const app = TestBed.createComponent(AppComponent).componentInstance;
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await app.goToHome();

    expect(consoleError).toHaveBeenCalledWith('Navigation failed', error);
    expect(openTemporarySnackBar).toHaveBeenCalledWith(
      'Unable to navigate. Please try again.',
    );
    consoleError.mockRestore();
  });
});
