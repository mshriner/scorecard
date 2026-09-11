import { DatePipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  AverageScorePipe,
  AverageScoreToParPipe,
  CountValidRoundsToAveragePipe,
} from './average-score.pipe';
import { CourseVarietySlicePipe } from './course-variety-slice.pipe';
import { CourseVarietyPipe } from './course-variety.pipe';
import { FormatThruPipe } from './format-thru-pipe';
import { MatchPlayStatusPipe } from './match-play-status.pipe';
import { ParPipe } from './par.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { RoundVarietyPipe } from './round-variety.pipe';
import { ScoreToParPipe, WordForScoreToParPipe } from './score-to-par.pipe';
import { FormatAppThemePipe, FormatTextSizePipe } from './settings-format.pipe';
import { TotalPuttsPipe } from './total-putts.pipe';
import { TotalRoundScorePipe } from './total-round-score.pipe';

@NgModule({
  imports: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    FormatThruPipe,
    MatchPlayStatusPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    WordForScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
    FormatAppThemePipe,
  ],
  exports: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    FormatThruPipe,
    MatchPlayStatusPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    WordForScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
    FormatAppThemePipe,
  ],
  providers: [
    ParPipe,
    CourseVarietyPipe,
    RoundVarietyPipe,
    CourseVarietySlicePipe,
    FormatThruPipe,
    MatchPlayStatusPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    WordForScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
    AverageScorePipe,
    AverageScoreToParPipe,
    CountValidRoundsToAveragePipe,
    FormatTextSizePipe,
    FormatAppThemePipe,
    DecimalPipe,
    DatePipe,
  ],
})
export class PipesModule {}
