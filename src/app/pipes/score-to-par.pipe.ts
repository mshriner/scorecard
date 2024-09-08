import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';
import { Round } from '../models/round';
import { CourseService } from '../services/course.service';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'scoreToPar',
  pure: false,
})
export class ScoreToParPipe implements PipeTransform {
  constructor(
    private courseService: CourseService,
    private roundVarietyScores: RoundVarietyScoresPipe
  ) {}

  transform(round: Round, course?: Course | null): string {
    if (!course) {
      course = this.courseService.getCourse(round.courseId);
    }
    if (!course) {
      throw new Error(`course with ID ${round.courseId} not found`);
    }
    const toPar = this.roundVarietyScores
      .transform(round.strokes.map(
        (holeScore, index) =>
          (holeScore || course.par[index]) - course.par[index]
      ), round.roundVariety)
      
      .reduce((prev, curr) => prev + curr);
    if (toPar > 0) {
      return `+${toPar}`;
    } else if (toPar < 0) {
      return `${toPar}`;
    }
    return `Even`;
  }
}
