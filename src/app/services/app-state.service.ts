import {
  computed,
  effect,
  Injectable,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocalUserWithFilters } from '../models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService implements OnDestroy {
  public readonly pageTitle: WritableSignal<string> = signal('');
  public readonly useSmallerButtons = computed(() => {
    const fontScaling = this.currentUser()?.appFontScaling || 0;
    document.documentElement.style.fontSize = `${100 + 15 * fontScaling}%`;
    return fontScaling > 2;
  });
  public readonly unsavedDataOnPage = signal<boolean>(false);
  public readonly currentUser = signal<LocalUserWithFilters | null>(null);

  private readonly routeSubscription: Subscription;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {
    this.routeSubscription = this.router.events.subscribe(() => {
      this.unsavedDataOnPage.set(false);
    });
    this.currentUser.set(this.userService.getCurrentUser());
    effect(() => {
      this.userService.setCurrentUser(this.currentUser());
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  public setPageTitle(newTitle: string): void {
    this.pageTitle.set(newTitle);
  }
}
