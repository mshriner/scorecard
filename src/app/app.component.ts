import { Location } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
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
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { AreYouSureDialogComponent } from './components/are-you-sure-dialog/are-you-sure-dialog.component';
import { EditProfileDialog } from './components/profiles/profiles.component';
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
import { NavigationMessageService } from './services/navigation-message.service';
import { SnackBarService } from './services/snack-bar.service';
import { UserService } from './services/user.service';
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
  appStateService = inject(AppStateService);
  private readonly router = inject(NavigationMessageService);
  private readonly dialog = inject(MatDialog);
  private readonly location = inject(Location);
  private readonly snackBarService = inject(SnackBarService);
  private readonly serviceWorker = inject(SwUpdate);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetection = inject(ChangeDetectorRef);
  private readonly userService = inject(UserService);

  public readonly showSpinner = signal(false);
  public readonly APP_THEMES = Object.values(AppTheme).filter(
    (val) => typeof val !== 'string',
  );
  public readonly AppTheme = AppTheme;

  @ViewChild('sidenav')
  sidenav?: MatSidenav;

  ngOnInit() {
    requestAnimationFrame(() => {
      if (sessionStorage.getItem(SESSION_STORAGE_KEYS.GO_TO_CHANGELOG)) {
        this.goToAbout();
      } else if (
        !this.hasNoRoute &&
        !this.isOnProfilesScreen &&
        !this.isOnAboutScreen &&
        !this.currentUser
      ) {
        this.logout();
      }
    });
    this.appStateService.useSmallerButtons();
    this.appStateService.appTheming();
    const doNotShowInstallPromptPreference =
      sessionStorage.getItem(
        SESSION_STORAGE_KEYS.DO_NOT_SHOW_PWA_PROMPT_AGAIN_THIS_SESSION,
      ) || this.currentUser?.pwaPrompted;
    const showInstallPrompt =
      !doNotShowInstallPromptPreference &&
      !this.isInFirefox &&
      !this.isInWebAppChromium &&
      !this.isInWebAppiOS;
    if (showInstallPrompt) {
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

  public get showHamburgerMenu(): boolean {
    return (
      this.isOnProfilesScreen ||
      this.isOnHomeScreen ||
      this.isOnCoursesScreen ||
      this.isOnAboutScreen
    );
  }

  private doGoBack(): void {
    const hasPreviousHistory = globalThis.history.length > 1;

    if (hasPreviousHistory) {
      this.location.back();
    } else {
      this.router.navigateByUrl(APP_ROUTES.HOME);
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
              sessionStorage.setItem(SESSION_STORAGE_KEYS.GO_TO_CHANGELOG, 'y');
              globalThis.location.reload();
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
        globalThis.location.reload();
      }
      this.appStateService.appTheming();
    });
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }

  public editProfile(): void {
    this.dialog
      .open(EditProfileDialog, {
        data: {
          profileName: this.currentUser?.name,
          checkAgainstOriginalProfileName: true,
        },
      })
      .afterClosed()
      .subscribe((newProfileName) => {
        const sanitizedName = newProfileName?.trim();
        if (sanitizedName?.length && this.currentUser) {
          this.currentUser.name = sanitizedName;
          this.userService.setCurrentUser(this.currentUser);
          this.appStateService.currentUser.set(
            this.userService.getCurrentUser(),
          );
          this.changeDetection.markForCheck();
        }
      });
  }

  private get isInWebAppiOS(): boolean {
    return (globalThis.navigator as any).standalone === true;
  }

  private get isInWebAppChromium() {
    return globalThis.matchMedia('(display-mode: standalone)').matches;
  }

  private get isInFirefox(): boolean {
    // Firefox doesn't appear to provide a way to detect if it's installed as a PWA
    return /firefox/i.test(globalThis.navigator.userAgent);
  }
}
