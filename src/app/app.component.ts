import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppStateService } from './services/app-state.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { APP_ROUTES } from './models/constants';
import { SnackBarService } from './services/snack-bar.service';
import { SnackBarComponent } from './components/snack-bar/snack-bar.component';

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
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    SnackBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private hotSubscriptions!: Subscription;

  constructor(public appStateService: AppStateService, private router: Router) {
    this.hotSubscriptions = new Subscription();
    if (!this.appStateService.currentUser) {
      this.logout();
    }
  }

  ngOnInit(): void {
    // this.initializeSubscriptions();
  }

  ngOnDestroy(): void {
    // this.hotSubscriptions.unsubscribe();
  }

  // private initializeSubscriptions(): void {
  //   this.hotSubscriptions.add(
  //     this.appStateService.pageTitle$?.subscribe(
  //       (newTitle) => (this.title = newTitle)
  //     )
  //   );
  // }

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
}
