import { Pipe, PipeTransform } from '@angular/core';
import { Course } from '../models/course';
import { Round, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({
  name: 'par',
  pure: false,
})
export class ParPipe implements PipeTransform {
  constructor(private roundVarietyScores: RoundVarietyScoresPipe) {}

  transform(course: Course, currentRound?: Round, half?: RoundVariety): number {
    return this.roundVarietyScores
      .transform(course.par, half || currentRound?.roundVariety)
      .reduce((prev, curr) => prev + curr);
  }
}
