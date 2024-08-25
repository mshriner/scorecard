import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';

@Pipe({
  name: 'par',
  standalone: true
})
export class ParPipe implements PipeTransform {

  transform(course: Course): number {
    return course.par.reduce((prev, curr) => prev + curr);
  }

}
