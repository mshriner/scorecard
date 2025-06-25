import { DatePipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  AverageScorePipe,
  AverageScoreToParPipe,
  CountValidRoundsToAveragePipe,
} from './average-score.pipe';
import { CourseVarietySlicePipe } from './course-variety-slice.pipe';
import { CourseVarietyPipe } from './course-variety.pipe';
import { FormatTextSizePipe } from './format-text-size.pipe';
import { ParPipe } from './par.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { RoundVarietyPipe } from './round-variety.pipe';
import { ScoreToParPipe } from './score-to-par.pipe';
import { TotalPuttsPipe } from './total-putts.pipe';
import { TotalRoundScorePipe } from './total-round-score.pipe';

@NgModule({
  imports: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
  ],
  exports: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
  ],
  providers: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
    DecimalPipe,
    DatePipe,
  ],
})
export class PipesModule {}
