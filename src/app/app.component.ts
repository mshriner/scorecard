import { Location } from '@angular/common';
import { Component, DestroyRef, signal, ViewChild } from '@angular/core';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet, RoutesRecognized } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, pairwise } from 'rxjs';
import { AreYouSureDialogComponent } from './components/are-you-sure-dialog/are-you-sure-dialog.component';
import { APP_ROUTES, UNSAVED_DATA } from './models/constants';
import { LocalUserWithFilters } from './models/user';
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
    MatChipsModule,
    PipesModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public readonly showSpinner = signal(false);
  private previousUrl: string | null = null;

  @ViewChild('sidenav')
  sidenav!: any;

  constructor(
    public appStateService: AppStateService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly location: Location,
    private readonly snackBarService: SnackBarService,
    private readonly serviceWorker: SwUpdate,
    private readonly destroyRef: DestroyRef,
  ) {
    if (!this.isOnProfilesScreen && !this.currentUser) {
      this.logout();
    }
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((e) => e instanceof RoutesRecognized),
        pairwise(),
      )
      .subscribe((e) => {
        this.previousUrl = e[0].urlAfterRedirects; // previous url
      });
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
      this.sidenav.close();
    });
  }

  public viewCourses(): void {
    this.router.navigateByUrl(APP_ROUTES.COURSES).then(() => {
      this.sidenav.close();
    });
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

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE).then(() => {
      this.sidenav.close();
    });
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND).then(() => {
      this.sidenav.close();
    });
  }

  public goToAbout(): void {
    this.router.navigateByUrl(APP_ROUTES.ABOUT).then(() => {
      this.sidenav.close();
    });
  }

  public checkForUpdates(): void {
    this.showSpinner.set(true);
    this.serviceWorker
      .checkForUpdate()
      .then((newUpdate) => {
        if (newUpdate) {
          this.snackBarService.openTemporarySnackBar(`Loading update...`);
          setTimeout(() => {
            window.location.reload();
          }, 1250);
        } else {
          this.snackBarService.openTemporarySnackBar(`No new updates found.`);
          this.showSpinner.set(false);
        }
      })
      .catch((err) => {
        this.snackBarService.openTemporarySnackBar(
          `Failed to refresh -- ${err}`,
        );
        this.showSpinner.set(false);
      });
  }

  public setTextSize(size: number): void {
    this.appStateService.currentUser.update((user) => {
      if (user) {
        user.appFontScaling = size;
      }
      return structuredClone(user);
    });
  }

  public get currentUser(): LocalUserWithFilters | null {
    return this.appStateService.currentUser();
  }
}
