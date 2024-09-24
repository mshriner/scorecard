import { Injectable } from '@angular/core';
import { Course } from '../models/course';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(
    private appStateService: AppStateService,
    private localStorageService: LocalStorageService,
  ) {}

  public getAllCoursesForCurrentUser(): Course[] {
    if (!this.appStateService.currentUser) {
      return [];
    }
    return this.getCoursesByIds(this.appStateService.currentUser.courseIds);
  }

  public getCoursesByIds(courseIds: string[]): Course[] {
    return (
      courseIds
        ?.map((courseId) => {
          const retrieved = this.localStorageService.getItem(courseId);
          if (!retrieved?.id) {
            return null;
          }
          return retrieved as Course;
        })
        ?.filter((value) => !!value) || ([] as Course[])
    );
  }

  public saveCourses(updatedCourses: Course[]): boolean {
    return updatedCourses
      ?.map((course) => this.localStorageService.setItem(course?.id, course))
      ?.every((result) => !!result);
  }

  public getCourse(courseId: string): Course | null {
    return this.getCoursesByIds([courseId])[0];
  }

  public getCourseName(courseId: string): string {
    return this.getCourse(courseId)?.name || '';
  }

  public setCourse(updatedCourse: Course): boolean {
    return this.saveCourses([updatedCourse]);
  }

  public deleteCourses(courseIdsToDelete: string[]): void {
    courseIdsToDelete?.forEach((courseId) =>
      this.localStorageService.removeItem(courseId),
    );
  }
}
