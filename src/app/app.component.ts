import { Location } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { APP_ROUTES, UNSAVED_DATA } from './models/constants';
import { AppStateService } from './services/app-state.service';
import { SnackBarService } from './services/snack-bar.service';
import { AreYouSureDialogComponent } from './components/are-you-sure-dialog/are-you-sure-dialog.component';

@Component({
    selector: 'app-root',
    imports: [
        FormsModule,
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
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  private _snackBar = inject(MatSnackBar);
  public showSpinner = signal(false);

  @ViewChild('sidenav')
  sidenav!: any;

  constructor(
    public appStateService: AppStateService,
    private router: Router,
    private dialog: MatDialog,
    private location: Location,
    private snackBarService: SnackBarService,
    private serviceWorker: SwUpdate,
  ) {
    if (!this.isOnProfilesScreen && !this.appStateService.currentUser) {
      this.logout();
    }
  }

  public logout(): void {
    this.appStateService.currentUser = null;
    this.router.navigateByUrl(APP_ROUTES.PROFILES).then(() => {
      this.sidenav.close();
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
            this.location.back();
          }
        });
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

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE).then(() => {
      this.sidenav.close();
    });
  }

  public addNewRound(): void {
    if (!this.appStateService.currentUser?.courseIds?.length) {
      this.snackBarService.openTemporarySnackBar('Please add a course first.');
    } else {
      this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND).then(() => {
        this.sidenav.close();
      });
    }
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
}
