import { Pipe, PipeTransform, inject } from '@angular/core';
import { EIGHTEEN_NUMBERS_ZEROED } from '../models/course';
import { EMPTY_EIGHTEEN_NUMBERS, RoundLike } from '../models/round';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

@Pipe({ name: 'matchPlayStatus', pure: false })
export class MatchPlayStatusPipe implements PipeTransform {
  private readonly roundVarietyScores = inject(RoundVarietyScoresPipe);

  transform(round: RoundLike): string {
    const selectedStrokes = this.roundVarietyScores.transform(
      round.strokes,
      round.roundVariety,
    );
    const selectedOpponentStrokes = this.roundVarietyScores.transform(
      round.matchPlay?.opponentStrokes || EMPTY_EIGHTEEN_NUMBERS,
      round.roundVariety,
    );
    const selectedOpponentAdvantage = this.roundVarietyScores.transform(
      round.matchPlay?.opponentAdvantage || EIGHTEEN_NUMBERS_ZEROED,
      round.roundVariety,
    );

    let playerWins = 0;
    let opponentWins = 0;

    for (let holeIndex = 0; holeIndex < selectedStrokes.length; holeIndex++) {
      const playerScore = selectedStrokes[holeIndex];
      const opponentScore = selectedOpponentStrokes[holeIndex];
      const advantage = selectedOpponentAdvantage[holeIndex] ?? 0;

      if (playerScore == null || opponentScore == null) {
        continue;
      }

      const playerNet = playerScore;
      const opponentNet = opponentScore - (advantage || 0);

      if (playerNet < opponentNet) {
        playerWins++;
      } else if (opponentNet < playerNet) {
        opponentWins++;
      }
    }

    const margin = playerWins - opponentWins;
    if (margin === 0) {
      return 'AS';
    }
    return `${Math.abs(margin)} ${margin > 0 ? 'UP' : 'DN'}`;
  }
}
