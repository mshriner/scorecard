import {
  Injectable,
  signal,
  WritableSignal
} from '@angular/core';
import { User } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private _currentUser: User | null = null;
  public pageTitle: WritableSignal<string> = signal('');

  constructor(private userService: UserService) {}

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
    this.userService.setCurrentUser(nextUser);
  }

  public setPageTitle(newTitle: string): void {
    this.pageTitle.set(newTitle);
  }
}
