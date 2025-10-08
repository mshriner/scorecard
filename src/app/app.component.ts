import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet, RoutesRecognized } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, pairwise } from 'rxjs';
import { AreYouSureDialogComponent } from './components/are-you-sure-dialog/are-you-sure-dialog.component';
import { PwaInstallDialogComponent } from './components/pwa-install-dialog/pwa-install-dialog.component';
import {
  APP_ROUTES,
  SESSION_STORAGE_KEYS,
  UNSAVED_DATA,
} from './models/constants';
import {
  AppTheme,
  LocalUserWithFilters,
  WhenToShowPWADialogAgain,
} from './models/user';
import { PipesModule } from './pipes/pipes.module';
import { AppStateService } from './services/app-state.service';
import { SnackBarService } from './services/snack-bar.service';
@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatMenuModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatRippleModule,
    MatSidenavModule,
    MatDividerModule,
    MatInputModule,
    RouterOutlet,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatSlideToggleModule,
    PipesModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  public readonly showSpinner = signal(false);
  private previousUrl: string | null = null;
  public readonly APP_THEMES = Object.values(AppTheme).filter(
    (val) => typeof val !== 'string',
  );
  public readonly AppTheme = AppTheme;

  @ViewChild('sidenav')
  sidenav?: MatSidenav;

  constructor(
    public appStateService: AppStateService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly location: Location,
    private readonly snackBarService: SnackBarService,
    private readonly serviceWorker: SwUpdate,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    requestAnimationFrame(() => {
      if (
        !this.hasNoRoute &&
        !this.isOnProfilesScreen &&
        !this.isOnAboutScreen &&
        !this.currentUser
      ) {
        this.logout();
      }
    });
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e) => e instanceof RoutesRecognized),
        pairwise(),
      )
      .subscribe((e) => {
        this.previousUrl = e[0].urlAfterRedirects; // previous url
      });
    this.appStateService.useSmallerButtons();
    this.appStateService.appTheming();
    const doNotShowInstallPrompt =
      sessionStorage.getItem(
        SESSION_STORAGE_KEYS.DO_NOT_SHOW_PWA_PROMPT_AGAIN_THIS_SESSION,
      ) || this.currentUser?.pwaPrompted;
    const isPwa =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (!isPwa && !doNotShowInstallPrompt) {
      setTimeout(() => {
        this.dialog
          .open(PwaInstallDialogComponent)
          .afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((result: WhenToShowPWADialogAgain) => {
            if (result === 'later' || !this.currentUser) {
              sessionStorage.setItem(
                SESSION_STORAGE_KEYS.DO_NOT_SHOW_PWA_PROMPT_AGAIN_THIS_SESSION,
                'y',
              );
            } else if (result === 'never') {
              this.appStateService.currentUser.update((user) => {
                if (user) {
                  user.pwaPrompted = true;
                }
                return structuredClone(user);
              });
            }
            this.checkForUpdates(false);
          });
      }, 2000);
    } else {
      this.checkForUpdates(false);
    }
  }

  ngAfterViewInit() {
    if (sessionStorage.getItem(SESSION_STORAGE_KEYS.OPEN_SIDENAV_ON_RELOAD)) {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.OPEN_SIDENAV_ON_RELOAD);
      this.sidenav?.open();
    }
  }

  public logout(): void {
    this.appStateService.currentUser.set(null);
    this.router.navigateByUrl(APP_ROUTES.PROFILES).then(() => {
      this.sidenav?.close();
    });
  }

  public goBack(): void {
    if (this.appStateService.unsavedDataOnPage()) {
      this.dialog
        .open(AreYouSureDialogComponent, {
          data: UNSAVED_DATA,
        })
        .afterClosed()
        .subscribe((confirmed) => {
          if (confirmed) {
            this.doGoBack();
          }
        });
    } else {
      this.doGoBack();
    }
  }

  public get hasNoRoute(): boolean {
    return this.router.url === `/`;
  }

  public get isOnHomeScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.HOME}`;
  }

  public get isOnCoursesScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.COURSES}`;
  }

  public get isOnProfilesScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.PROFILES}`;
  }

  public get isOnWipeDataScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.CLEAR_DATA}`;
  }

  public get isOnEditCourseScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.ADD_EDIT_COURSE}`;
  }

  public get isOnEditRoundScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.ADD_EDIT_ROUND}`;
  }

  public get isOnAboutScreen(): boolean {
    return this.router.url === `/${APP_ROUTES.ABOUT}`;
  }

  private doGoBack(): void {
    if (this.previousUrl) {
      this.router.navigateByUrl(this.previousUrl);
    } else if (this.isOnEditCourseScreen) {
      this.router.navigateByUrl(APP_ROUTES.COURSES);
    } else if (this.isOnEditRoundScreen) {
      this.router.navigateByUrl(APP_ROUTES.HOME);
    } else {
      this.location.back();
    }
  }

  public goToHome(): void {
    this.router.navigateByUrl(APP_ROUTES.HOME).then(() => {
      this.sidenav?.close();
    });
  }

  public goToProfiles(): void {
    this.router.navigateByUrl(APP_ROUTES.PROFILES).then(() => {
      this.sidenav?.close();
    });
  }

  public viewCourses(): void {
    this.router.navigateByUrl(APP_ROUTES.COURSES).then(() => {
      this.sidenav?.close();
    });
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE).then(() => {
      this.sidenav?.close();
    });
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND).then(() => {
      this.sidenav?.close();
    });
  }

  public async goToAbout(): Promise<void> {
    return this.router.navigateByUrl(APP_ROUTES.ABOUT).then(() => {
      this.sidenav?.close();
    });
  }

  public checkForUpdates(showFailureMessages: boolean): void {
    try {
      if (!this.serviceWorker.isEnabled) {
        if (showFailureMessages) {
          this.snackBarService.openTemporarySnackBar(
            `Unable to check for updates at this time.`,
          );
        }
        return;
      }
      this.showSpinner.set(true);
      this.serviceWorker.checkForUpdate().then(
        (newUpdate) => {
          if (newUpdate) {
            this.snackBarService.openTemporarySnackBar(`Loading update...`);
            setTimeout(() => {
              this.goToAbout().then(() => {
                sessionStorage.setItem(
                  SESSION_STORAGE_KEYS.GO_TO_CHANGELOG,
                  'y',
                );
                window.location.reload();
              });
            }, 1250);
          } else {
            if (showFailureMessages) {
              this.snackBarService.openTemporarySnackBar(
                `No new updates found.`,
              );
            }
            this.showSpinner.set(false);
          }
        },
        (err) => {
          if (showFailureMessages) {
            this.snackBarService.openTemporarySnackBar(
              `Failed to refresh -- ${err}`,
            );
          }
          this.showSpinner.set(false);
        },
      );
    } catch (e) {
      console.error(e);
      this.showSpinner.set(false);
    }
  }

  public setTextSize(size: number): void {
    this.appStateService.currentUser.update((user) => {
      if (user) {
        user.appFontScaling = size;
      }
      return structuredClone(user);
    });
    setTimeout(() => {
      this.appStateService.useSmallerButtons();
    });
  }

  public setTheme(theme: AppTheme): void {
    this.appStateService.currentUser.update((user) => {
      if (user) {
        user.theme = theme;
      }
      return structuredClone(user);
    });
    setTimeout(() => {
      if (this.currentUser?.theme === AppTheme.SYSTEM) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEYS.OPEN_SIDENAV_ON_RELOAD,
          'y',
        );
        window.location.reload();
      }
      this.appStateService.appTheming();
    });
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }
}
