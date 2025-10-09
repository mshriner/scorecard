import { Pipe, PipeTransform, inject } from '@angular/core';
import { Course } from '../models/course';
import { RoundLike, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'par',
  pure: false,
})
export class ParPipe implements PipeTransform {
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);

  transform(
    course: Course,
    currentRound?: RoundLike,
    half?: RoundVariety,
  ): number {
    return (
      this.roundVarietyScores
        .transform(course.par, half || currentRound?.roundVariety)
        .reduce((prev, curr) => (prev || 0) + (curr || 0)) || 0
    );
  }
}
