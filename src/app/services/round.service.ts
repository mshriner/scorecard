import { inject, Service } from '@angular/core';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  EMPTY_NINE_NUMBERS,
  Round,
  RoundVariety,
} from '../models/round';
import { RoundVarietyScoresPipe } from '../pipes/round-variety-scores.pipe';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

@Service()
export class RoundService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly appStateService = inject(AppStateService);

  private readonly roundVarietyScoresPipe = new RoundVarietyScoresPipe();

  public getRoundById(roundId: string): Round | null {
    const retrieved = this.localStorageService.getRound(roundId);
    if (!retrieved) {
      return null;
    }
    retrieved.roundVariety ??= RoundVariety.EIGHTEEN;
    retrieved.matchPlay ??= {};
    retrieved.matchPlay.opponentStrokes ??=
      retrieved.roundVariety === RoundVariety.EIGHTEEN
        ? structuredClone(EMPTY_EIGHTEEN_NUMBERS)
        : structuredClone(EMPTY_NINE_NUMBERS);
    retrieved.matchPlay.opponentAdvantage ??=
      retrieved.roundVariety === RoundVariety.EIGHTEEN
        ? structuredClone(EMPTY_EIGHTEEN_NUMBERS)
        : structuredClone(EMPTY_NINE_NUMBERS);
    return retrieved;
  }

  public getRoundsByIds(roundIds?: string[]): Round[] {
    return (
      roundIds
        ?.map((roundId) => this.getRoundById(roundId))
        ?.filter((value) => !!value) || ([] as Round[])
    ).map((round) => {
      // setting default values
      if (!round.roundVariety) {
        round.roundVariety = RoundVariety.EIGHTEEN;
      }
      return round;
    });
  }

  public saveRounds(updatedRounds: Round[], addToCurrentUser = true): boolean {
    if (addToCurrentUser) {
      this.appStateService.currentUser.update((updatedCurrentUser) => {
        if (updatedCurrentUser) {
          for (const round of updatedRounds) {
            if (!updatedCurrentUser.roundIds?.includes(round.id)) {
              updatedCurrentUser.roundIds.push(round.id);
            }
            if (
              Array.isArray(updatedCurrentUser.courseStatsFilterSelect) &&
              !updatedCurrentUser.courseStatsFilterSelect?.includes(
                round.courseId,
              )
            ) {
              // if the user did not have this course selected
              // before creating or updating this course, keep all courses selected
              updatedCurrentUser.courseStatsFilterSelect.push(round.courseId);
            }
          }
        }
        return structuredClone(updatedCurrentUser);
      });
    }
    return updatedRounds
      ?.map((round) => {
        // clear strokes and putts not used
        switch (round?.roundVariety) {
          case RoundVariety.BACK_NINE: {
            for (let index = 0; index < 9; index++) {
              round.putts[index] = null;
              round.strokes[index] = null;
              if (round.matchPlay?.opponentStrokes) {
                round.matchPlay.opponentStrokes[index] = null;
              }
              if (round.matchPlay?.opponentAdvantage) {
                round.matchPlay.opponentAdvantage[index] = null;
              }
            }
            break;
          }
          case RoundVariety.FRONT_NINE: {
            for (let index = 9; index < 18; index++) {
              round.putts[index] = null;
              round.strokes[index] = null;
              if (round.matchPlay?.opponentStrokes) {
                round.matchPlay.opponentStrokes[index] = null;
              }
              if (round.matchPlay?.opponentAdvantage) {
                round.matchPlay.opponentAdvantage[index] = null;
              }
            }
            break;
          }
          case RoundVariety.FULL_NINE: {
            round.putts = this.roundVarietyScoresPipe.transform(
              round.putts,
              RoundVariety.FULL_NINE,
            );
            round.strokes = this.roundVarietyScoresPipe.transform(
              round.strokes,
              RoundVariety.FULL_NINE,
            );
            if (round.matchPlay?.opponentStrokes) {
              round.matchPlay.opponentStrokes =
                this.roundVarietyScoresPipe.transform(
                  round.matchPlay.opponentStrokes,
                  RoundVariety.FULL_NINE,
                );
            }
            if (round.matchPlay?.opponentAdvantage) {
              round.matchPlay.opponentAdvantage =
                this.roundVarietyScoresPipe.transform(
                  round.matchPlay.opponentAdvantage,
                  RoundVariety.FULL_NINE,
                );
            }
            break;
          }
        }

        for (let index = 0; index < round.strokes.length; index++) {
          if (!round.strokes[index]) {
            round.strokes[index] = null;
          }
        }

        if (round.matchPlay?.opponentStrokes) {
          for (
            let index = 0;
            index < round.matchPlay.opponentStrokes.length;
            index++
          ) {
            if (!round.matchPlay.opponentStrokes[index]) {
              round.matchPlay.opponentStrokes[index] = null;
            }
          }
        }

        if (round.matchPlay?.opponentAdvantage) {
          for (
            let index = 0;
            index < round.matchPlay.opponentAdvantage.length;
            index++
          ) {
            if (!round.matchPlay.opponentAdvantage[index]) {
              round.matchPlay.opponentAdvantage[index] = null;
            }
          }
        }

        if (!round?.generalNotes) {
          round.generalNotes = '';
        } else {
          round.generalNotes = round.generalNotes.trim();
        }
        return this.localStorageService.setRound(round);
      })
      ?.every((result) => !!result);
  }

  public deleteRounds(roundIdsToDelete?: string[]): void {
    roundIdsToDelete?.forEach((roundId) =>
      this.localStorageService.removeItem(roundId),
    );
  }
}
