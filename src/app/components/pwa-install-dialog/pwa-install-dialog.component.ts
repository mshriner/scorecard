import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../services/app-state.service';
import { WhenToShowPWADialogAgain } from '../../models/user';

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
  public readonly isIOS: boolean;
  public readonly isAndroid: boolean;
  public readonly isNeverShowAgainAnOption: boolean;

  constructor(
    public dialogRef: MatDialogRef<PwaInstallDialogComponent>,
    private readonly appStateService: AppStateService,
  ) {
    const userAgent = window.navigator.userAgent.toLowerCase();
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
