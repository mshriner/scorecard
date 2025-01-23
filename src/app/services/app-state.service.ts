import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { User } from '../models/user';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppStateService implements OnDestroy {
  private _currentUser: User | null = null;
  public readonly pageTitle: WritableSignal<string> = signal('');
  public readonly useSmallerButtons = signal(false);
  public readonly unsavedDataOnPage = signal<boolean>(false);

  private routeSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this._currentUser = this.userService.getCurrentUser();
    this.updateFontSize();
    this.routeSubscription = this.router.events.subscribe(() => {
      this.unsavedDataOnPage.set(false);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
