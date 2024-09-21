import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { APP_ROUTES } from './models/constants';
import { AppStateService } from './services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
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

  constructor(public appStateService: AppStateService, private router: Router) {
    if (!this.isOnProfilesScreen && !this.appStateService.currentUser) {
      this.logout();
    }
  }

  public logout(): void {
    this.appStateService.currentUser = null;
    this.router.navigateByUrl(APP_ROUTES.PROFILES);
  }

  public goToHome(): void {
    this.router.navigateByUrl(APP_ROUTES.HOME);
  }

  public viewCourses(): void {
    this.router.navigateByUrl(APP_ROUTES.COURSES);
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
}
