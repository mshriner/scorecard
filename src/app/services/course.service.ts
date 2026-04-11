import { Injectable, inject } from '@angular/core';
import { Course } from '../models/course';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly appStateService = inject(AppStateService);
  private readonly localStorageService = inject(LocalStorageService);

  public getAllCoursesForCurrentUser(): Course[] {
    if (!this.appStateService.currentUser()) {
      return [];
    }
    return this.getCoursesByIds(this.appStateService.currentUser()!.courseIds);
  }

  public getCoursesByIds(courseIds: string[]): Course[] {
    return (
      courseIds
        ?.map((courseId) => this.localStorageService.getCourse(courseId))
        ?.filter((value) => !!value) || ([] as Course[])
    );
  }

  private saveCourses(updatedCourses: Course[]): boolean {
    return updatedCourses
      ?.map((course) => {
        course.name = course.name?.trim() || '';
        return this.localStorageService.setCourse(course);
      })
      ?.every((result) => !!result);
  }

  public getCourse(courseId?: string): Course | null {
    if (!courseId) {
      return null;
    }
    return this.getCoursesByIds([courseId])[0];
  }

  public getCourseName(courseId: string): string {
    return this.getCourse(courseId)?.name ?? '';
  }

  public setCourse(updatedCourse: Course): boolean {
    this.appStateService.currentUser.update((user) => {
      if (user) {
        if (!user.courseIds?.includes(updatedCourse.id)) {
          user.courseIds.push(updatedCourse.id);
        }
      }
      return structuredClone(user);
    });
    return this.saveCourses([updatedCourse]);
  }

  public deleteCourses(courseIdsToDelete?: string[]): void {
    if (!courseIdsToDelete) {
      return;
    }
    for (const courseId of courseIdsToDelete) {
      this.localStorageService.removeItem(courseId);
    }
  }
}
