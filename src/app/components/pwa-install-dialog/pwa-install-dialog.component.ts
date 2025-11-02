import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { WhenToShowPWADialogAgain } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-pwa-install-dialog',
  templateUrl: './pwa-install-dialog.component.html',
  styleUrls: ['./pwa-install-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
})
export class PwaInstallDialogComponent {
  dialogRef = inject<MatDialogRef<PwaInstallDialogComponent>>(MatDialogRef);
  private readonly appStateService = inject(AppStateService);

  public readonly isIOS: boolean;
  public readonly isAndroid: boolean;
  public readonly isNeverShowAgainAnOption: boolean;

  constructor() {
    const userAgent = globalThis.navigator.userAgent.toLowerCase();
    this.isIOS = /iphone|ipad|ipod/.test(userAgent);
    this.isAndroid = /android/.test(userAgent);
    this.isNeverShowAgainAnOption = !!this.appStateService.currentUser();
  }

  private close(when: WhenToShowPWADialogAgain): void {
    this.dialogRef.close(when);
  }

  public doNotShowAgainThisSession(): void {
    this.close('later');
  }

  public neverShowAgain(): void {
    this.close('never');
  }
}
