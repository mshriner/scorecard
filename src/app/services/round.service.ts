import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Round } from '../models/round';

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
    );
  }

  public saveRounds(updatedRounds: Round[]): boolean {
    return updatedRounds
      ?.map((round) => this.localStorageService.setItem(round?.id, round))
      ?.every((result) => !!result);
  }
}
