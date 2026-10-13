import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Service()
export class SnackBarService {
  private readonly _snackBar = inject(MatSnackBar);
  constructor() {}

  public openTemporarySnackBar(
    message: string,
    action: string = 'Dismiss',
    onAction?: () => void,
  ): void {
    const trimmed = message?.trim();
    if (!trimmed) {
      return;
    }
    const snackBarRef = this._snackBar.open(trimmed, action, {
      duration: 4000,
    });
    if (onAction) {
      snackBarRef.onAction().subscribe(onAction);
    }
  }
}
