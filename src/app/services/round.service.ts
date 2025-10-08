import { Injectable } from '@angular/core';
import { Round, RoundVariety } from '../models/round';
import { RoundVarietyScoresPipe } from '../pipes/round-variety-scores.pipe';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RoundService {
  private readonly roundVarietyScoresPipe = new RoundVarietyScoresPipe();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly appStateService: AppStateService,
  ) {}

  public getRoundById(roundId: string): Round | null {
    const retrieved = this.localStorageService.getItem(roundId);
    if (!retrieved?.id) {
      return null;
    }
    retrieved.roundVariety ??= RoundVariety.EIGHTEEN;
    return retrieved as Round;
  }

  public getRoundsByIds(roundIds?: string[]): Round[] {
    return (
      roundIds
        ?.map((roundId) => {
          const retrieved = this.localStorageService.getItem(roundId);
          if (!retrieved?.id) {
            return null;
          }
          return retrieved as Round;
        })
        ?.filter((value) => !!value) || ([] as Round[])
    ).map((round) => {
      // setting defult values
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
            }
            break;
          }
          case RoundVariety.FRONT_NINE: {
            for (let index = 9; index < 18; index++) {
              round.putts[index] = null;
              round.strokes[index] = null;
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
          }
        }

        for (let index = 0; index < round.strokes.length; index++) {
          if (!round.strokes[index]) {
            round.strokes[index] = null;
          }
        }

        if (!round?.generalNotes) {
          round.generalNotes = '';
        } else {
          round.generalNotes = round.generalNotes.trim();
        }
        return this.localStorageService.setItem(round?.id, round);
      })
      ?.every((result) => !!result);
  }

  public deleteRounds(roundIdsToDelete?: string[]): void {
    roundIdsToDelete?.forEach((roundId) =>
      this.localStorageService.removeItem(roundId),
    );
  }
}
