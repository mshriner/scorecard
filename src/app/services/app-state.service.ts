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
import { AppTheme, LocalUserWithFilters } from '../models/user';
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
  public readonly appTheming = computed(() => {
    const theme = this.currentUser()?.theme ?? AppTheme.SYSTEM;
    switch (theme) {
      case AppTheme.DARK: {
        document.body.classList.remove(
          'system-preference-theme',
          'override-to-light-theme',
        );
        document.body.classList.add('override-to-dark-theme');
        break;
      }
      case AppTheme.LIGHT: {
        document.body.classList.remove(
          'system-preference-theme',
          'override-to-dark-theme',
        );
        document.body.classList.add('override-to-light-theme');
        break;
      }
      case AppTheme.SYSTEM:
      default: {
        document.body.classList.remove(
          'override-to-dark-theme',
          'override-to-dark-theme',
        );
        document.body.classList.add('system-preference-theme');
        break;
      }
    }

    return theme;
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
