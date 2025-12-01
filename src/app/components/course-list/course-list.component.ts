import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { NavigationMessageService } from '../../services/navigation-message.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-course-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    PipesModule,
    MatRippleModule,
    NgTemplateOutlet,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  appStateService = inject(AppStateService);
  courseService = inject(CourseService);
  userService = inject(UserService);
  private readonly router = inject(NavigationMessageService);
  private readonly snackBarService = inject(SnackBarService);

  public courses: WritableSignal<Course[]> = signal([]);

  public readonly COURSE_NAME_COL = 'courseName';
  public readonly COURSE_PAR_COL = 'coursePar';
  public readonly COURSE_TABLE_COLUMNS = [
    this.COURSE_NAME_COL,
    this.COURSE_PAR_COL,
  ];

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.appStateService.currentUser()?.name?.trim()}'s Courses`,
    );
    this.courses.set(
      this.courseService
        .getAllCoursesForCurrentUser()
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  public viewCourse(courseId: string, message?: string): void {
    this.router.navigateByUrl(
      APP_ROUTES.ADD_EDIT_COURSE,
      {
        state: {
          [NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT]: courseId,
        },
      },
      message,
    );
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND);
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }
}
