import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly CURRENT_USER_KEY = 'CURRENT_USER';

  private _currentUser = '';

  constructor(private localStorageService: LocalStorageService) {}

  public get currentUser(): string {
    if (!this._currentUser) {
      this._currentUser =
        this.localStorageService.getItem(this.CURRENT_USER_KEY) || '';
    }
    return this._currentUser;
  }

  public set currentUser(nextUser: string) {
    this._currentUser = nextUser;
    this.localStorageService.setItem(this.CURRENT_USER_KEY, nextUser);
  }
}
