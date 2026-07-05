import { inject, Service } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Service()
export class SnackBarService {
  private readonly _snackBar = inject(MatSnackBar);
  constructor() {}

  public openTemporarySnackBar(
    message: string,
    action: string = 'Dismiss',
  ): void {
    const trimmed = message?.trim();
    if (!trimmed) {
      return;
    }
    this._snackBar.open(trimmed, action, {
      duration: 4000,
    });
  }
}
