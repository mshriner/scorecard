import { Pipe, PipeTransform } from '@angular/core';
import { Round } from '../models/round';
import { CourseService } from '../services/course.service';
import { Course } from '../models/course';

@Pipe({
  name: 'scoreToPar',
  standalone: true,
  pure: false,
})
export class ScoreToParPipe implements PipeTransform {
  constructor(private courseService: CourseService) {}

  transform(round: Round, course?: Course | null): string {
    if (!course) {
      course = this.courseService.getCourse(round.courseId);
    }
    if (!course) {
      throw new Error(`course with ID ${round.courseId} not found`);
    }
    const toPar = round.strokes
      .map(
        (holeScore, index) =>
          (holeScore || course.par[index]) - course.par[index]
      )
      .reduce((prev, curr) => prev + curr);
    if (toPar > 0) {
      return `+${toPar}`;
    } else if (toPar < 0) {
      return `${toPar}`;
    }
    return `Even`;
  }
}
