import { Injectable } from '@angular/core';
import { Round, RoundVariety } from '../models/round';
import { AppStateService } from './app-state.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RoundService {
  constructor(
    private localStorageService: LocalStorageService,
    private appStateService: AppStateService,
  ) {}

  public getRoundById(roundId: string): Round | null {
    const retrieved = this.localStorageService.getItem(roundId);
    if (!retrieved?.id) {
      return null;
    }
    if (!retrieved.roundVariety) {
      retrieved.roundVariety = RoundVariety.EIGHTEEN;
    }
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

  public saveRounds(updatedRounds: Round[]): boolean {
    this.appStateService.currentUser.update((updatedCurrentUser) => {
      if (updatedCurrentUser) {
        for (const round of updatedRounds) {
          if (!updatedCurrentUser.roundIds?.includes(round.id)) {
            updatedCurrentUser.roundIds.push(round.id);
          }
          if (
            updatedCurrentUser.courseIds?.length &&
            updatedCurrentUser.courseStatsFilterSelect?.length ===
              updatedCurrentUser.courseIds?.length - 1 &&
            !updatedCurrentUser.courseStatsFilterSelect?.includes(
              round.courseId,
            )
          ) {
            // if the user had all courses selected before creating this course, keep all courses selected
            updatedCurrentUser.courseStatsFilterSelect.push(round.courseId);
          }
        }
      }
      return structuredClone(updatedCurrentUser);
    });
    return updatedRounds
      ?.map((round) => {
        // clear strokes and putts not used
        switch (round?.roundVariety) {
          case RoundVariety.BACK_NINE: {
            for (let index = 0; index < 9; index++) {
              delete round.putts[index];
              round.strokes[index] = 0;
            }
            break;
          }
          case RoundVariety.FRONT_NINE: {
            for (let index = 9; index < 18; index++) {
              delete round.putts[index];
              round.strokes[index] = 0;
            }
            break;
          }
        }
        if (!round?.generalNotes?.trim()) {
          round.generalNotes = '';
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
