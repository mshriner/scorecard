import { Injectable, inject } from '@angular/core';
import {
  Navigation,
  NavigationBehaviorOptions,
  NavigationEnd,
  Router,
  UrlTree,
} from '@angular/router';
import { SnackBarService } from './snack-bar.service';

/**
 * Service that allows saving a navigation message to sessionStorage and
 * displaying it after the next successful navigation via the SnackBarService.
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationMessageService {
  private readonly router = inject(Router);
  private readonly snackBarService = inject(SnackBarService);
  private readonly STORAGE_KEY = 'navigationMessage';

  constructor() {
    // On every successful navigation, check for a saved message and show it.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let message: string | null = null;
        try {
          message = sessionStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
          // If sessionStorage is not available or fails, don't break the router event stream.
          console.error(
            'Failed to read navigation message from sessionStorage',
            e,
          );
          message = null;
        }

        if (message) {
          try {
            this.snackBarService.openTemporarySnackBar(message);
          } finally {
            try {
              sessionStorage.removeItem(this.STORAGE_KEY);
            } catch {
              // ignore failures when removing
            }
          }
        }
      }
    });
  }

  /**
   * Mirror of Router.navigateByUrl but accepts an optional navigationMessage.
   * If navigationMessage is provided, it will be saved to sessionStorage and
   * displayed by this service after the navigation completes.
   *
   * @param url - target url or UrlTree
   * @param extras - navigation extras forwarded to Router.navigateByUrl
   * @param navigationMessage - optional message to show after navigation
   */
  public navigateByUrl(
    url: string | UrlTree,
    extras?: NavigationBehaviorOptions,
    navigationMessage?: string,
  ): Promise<boolean> {
    if (navigationMessage) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, navigationMessage);
      } catch (e) {
        // If sessionStorage is not available or fails, still attempt navigation.
        console.error('Failed to save navigation message to sessionStorage', e);
      }
    }

    return this.router.navigateByUrl(url, extras);
  }

  /**
   * Mirror of Router.getCurrentNavigation.
   * Returns the current `Navigation` object when the router is navigating,
   * and `null` when idle.
   */
  public getCurrentNavigation(): Navigation | null {
    return this.router.getCurrentNavigation();
  }
}
