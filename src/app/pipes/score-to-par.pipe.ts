import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';
import { RoundLike, RoundVariety } from '../models/round';
import { EighteenNumbers, NineNumbers } from '../models/storage-object';
import { CourseService } from '../services/course.service';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'scoreToPar',
  pure: false,
})
export class ScoreToParPipe implements PipeTransform {
  constructor(
    private readonly courseService: CourseService,
    private readonly roundVarietyScores: RoundVarietyScoresPipe,
  ) {}

  transform(
    round: RoundLike,
    course?: Course | null,
    half?: RoundVariety,
  ): string {
    course ??= this.courseService.getCourse(round.courseId);
    if (!course) {
      throw new Error(`course with ID ${round.courseId} not found`);
    }
    const toPar =
      this.roundVarietyScores
        .transform(
          round.strokes.map(
            (holeScore, index) =>
              (holeScore || course.par[index]) - course.par[index],
          ) as NineNumbers | EighteenNumbers,
          half || round.roundVariety,
        )
        .reduce((prev, curr) => (prev || 0) + (curr || 0)) || 0;
    if (toPar > 0) {
      return `+${toPar}`;
    } else if (toPar < 0) {
      return `${toPar}`;
    }
    return `E`;
  }
}
