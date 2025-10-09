import { Pipe, PipeTransform, inject } from '@angular/core';
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
  private readonly courseService = inject(CourseService);
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);

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

@Pipe({
  name: 'wordForScoreToPar',
})
export class WordForScoreToParPipe implements PipeTransform {
  transform(score: number, par: number): string {
    if (!score) {
      return '(Empty)';
    }
    if (score === 1) {
      return 'Hole in\nOne!';
    }
    const scoreToPar = score - par;
    if (scoreToPar < -3) {
      return `${scoreToPar}`;
    }
    if (scoreToPar === -3) {
      return 'Albatross';
    }
    if (scoreToPar === -2) {
      return 'Eagle';
    }
    if (scoreToPar === -1) {
      return 'Birdie';
    }
    if (scoreToPar === 0) {
      return 'Par';
    }
    if (scoreToPar === 1) {
      return 'Bogey';
    }
    if (scoreToPar === 2) {
      return 'Double\nBogey';
    }
    if (scoreToPar === 3) {
      return 'Triple\nBogey';
    }
    return `+${scoreToPar}`;
  }
}
