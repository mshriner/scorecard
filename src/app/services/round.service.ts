import { Injectable } from '@angular/core';
import { Round, RoundVariety } from '../models/round';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RoundService {
  constructor(private localStorageService: LocalStorageService) {}

  public getRoundsByIds(roundIds: string[]): Round[] {
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
        return this.localStorageService.setItem(round?.id, round);
      })
      ?.every((result) => !!result);
  }

  public deleteRounds(roundIdsToDelete: string[]): void {
    roundIdsToDelete?.forEach((roundId) =>
      this.localStorageService.removeItem(roundId)
    );
  }
}
