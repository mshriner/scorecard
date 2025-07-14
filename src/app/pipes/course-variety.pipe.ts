import { Pipe, PipeTransform } from '@angular/core';
import { CourseVariety, DisplayCourseVariety } from '../models/course';

@Pipe({ name: 'courseVariety' })
export class CourseVarietyPipe implements PipeTransform {
  transform(variety: CourseVariety | undefined): string {
    return DisplayCourseVariety[variety ?? CourseVariety.EIGHTEEN];
  }
}
