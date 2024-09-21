import { Injectable, signal, WritableSignal } from '@angular/core';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private _currentUser: User | null = null;
  public pageTitle: WritableSignal<string> = signal('');
  public useSmallerButtons = signal(false);

  constructor(private userService: UserService) {
    this._currentUser = this.userService.getCurrentUser();
    this.updateFontSize();
  }

  public get currentUser(): User | null {
    if (!this._currentUser) {
      this._currentUser = this.userService.getCurrentUser();
    }
    return this._currentUser;
  }

  public saveCurrentUser() {
    this.currentUser = this._currentUser;
  }

  public set currentUser(nextUser: User | null) {
    this._currentUser = nextUser;
    this.updateFontSize();
    this.userService.setCurrentUser(nextUser);
  }

  private setSmallerButtons(): void {
    this.useSmallerButtons.set((this._currentUser?.appFontScaling || 0) > 2);
  }

  private updateFontSize(): void {
    document.documentElement.style.fontSize = `${
      100 + 15 * (this._currentUser?.appFontScaling || 0)
    }%`;
    this.setSmallerButtons();
  }

  public setPageTitle(newTitle: string): void {
    this.pageTitle.set(newTitle);
  }
}
