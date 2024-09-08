import { NgModule } from '@angular/core';
import { ParPipe } from './par.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { RoundVarietyPipe } from './round-variety.pipe';
import { ScoreToParPipe } from './score-to-par.pipe';
import { TotalPuttsPipe } from './total-putts.pipe';
import { TotalRoundScorePipe } from './total-round-score.pipe';

@NgModule({
  declarations: [
    ParPipe,
    RoundVarietyPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
  ],
  exports: [
    ParPipe,
    RoundVarietyPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
  ],
  providers: [
    ParPipe,
    RoundVarietyPipe,
    RoundVarietyScoresPipe,
    ScoreToParPipe,
    TotalPuttsPipe,
    TotalRoundScorePipe,
  ],
})
export class PipesModule {}
