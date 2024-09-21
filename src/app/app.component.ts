import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { APP_ROUTES } from './models/constants';
import { AppStateService } from './services/app-state.service';
import { SnackBarService } from './services/snack-bar.service';

@Component({
  selector: 'app-root',
  standalone: true,
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
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private _snackBar = inject(MatSnackBar);

  @ViewChild('sidenav')
  sidenav!: any;

  constructor(
    public appStateService: AppStateService,
    private router: Router,
    private snackBarService: SnackBarService
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
}
