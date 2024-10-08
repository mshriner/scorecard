import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    PipesModule,
    MatRippleModule,
    CommonModule,
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit {
  public courses: WritableSignal<Course[]> = signal([]);

  public readonly COURSE_NAME_COL = 'courseName';
  public readonly COURSE_PAR_COL = 'coursePar';
  public readonly COURSE_TABLE_COLUMNS = [
    this.COURSE_NAME_COL,
    this.COURSE_PAR_COL,
  ];

  constructor(
    public appStateService: AppStateService,
    public courseService: CourseService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.appStateService.setPageTitle(
      `${this.appStateService.currentUser?.name?.trim()}'s Courses`,
    );
    this.courses.set(this.courseService.getAllCoursesForCurrentUser());
  }

  public viewCourse(courseId: string): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE, {
      state: {
        [NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT]: courseId,
      },
    });
  }

  public addNewRound(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND);
  }

  public addNewCourse(): void {
    this.router.navigateByUrl(APP_ROUTES.ADD_EDIT_COURSE);
  }
}
