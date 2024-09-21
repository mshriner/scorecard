import {
  Component,
  inject,
  model,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import {
  APP_NAME,
  APP_ROUTES,
  CLEAR_ALL_APP_DATA,
  DELETE_PROFILE,
} from '../../models/constants';
import { User } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserService } from '../../services/user.service';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRippleModule,
    MatDividerModule,
    AreYouSureDialogComponent,
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent {
  readonly profiles: WritableSignal<User[]> = signal([]);
  readonly dialog = inject(MatDialog);
  readonly APP_NAME = APP_NAME;
  readonly CLEAR_ALL = CLEAR_ALL_APP_DATA;
  public readonly PROFILE_TABLE_COLUMNS = ['username', 'delete'];
  public showSpinner = signal(false);

  constructor(
    public appStateService: AppStateService,
    private snackBarService: SnackBarService,
    private userService: UserService,
    private router: Router,
    private serviceWorker: SwUpdate
  ) {
    this.appStateService.setPageTitle('Profiles');
    this.profiles.set(this.userService.getAllUsers());
  }

  public selectProfile(selected: User): void {
    this.appStateService.currentUser = selected;
    this.router.navigateByUrl('/home');
  }

  public addNewProfile(): void {
    this.dialog
      .open(NewProfileDialog)
      .afterClosed()
      .subscribe((newProfileName) => {
        if (newProfileName !== undefined) {
          const newProfile: User = {
            id: `user-${crypto.randomUUID()}`,
            name: newProfileName,
            roundIds: [],
            courseIds: [],
            appFontScaling: 0,
          };
          this.profiles.set([...this.profiles(), newProfile]);
          this.userService.setUser(newProfile);
          this.saveProfileList();
        }
      });
  }

  public deleteProfile(idToDelete: string): void {
    this.dialog
      .open(AreYouSureDialogComponent, {
        data: DELETE_PROFILE,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.profiles.set(
            this.profiles().filter((profile) => profile.id !== idToDelete)
          );
          this.saveProfileList();
        }
      });
  }

  private saveProfileList(): void {
    this.userService.setAllUserIds(
      this.profiles().map((profile) => profile.id)
    );
  }

  public reload(): void {
    this.showSpinner.set(true);
    this.serviceWorker
      .checkForUpdate()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        this.snackBarService.openTemporarySnackBar(
          `Failed to refresh -- ${err}`
        );
      })
      .finally(() => this.showSpinner.set(false));
  }

  public clearAllData(): void {
    this.dialog
      .open(AreYouSureDialogComponent, {
        data: CLEAR_ALL_APP_DATA,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.router.navigateByUrl(APP_ROUTES.CLEAR_DATA);
        }
      });
  }
}

@Component({
  selector: 'new-profile-dialog',
  templateUrl: './new-profile-dialog.component.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class NewProfileDialog {
  readonly dialogRef = inject(MatDialogRef<NewProfileDialog>);
  readonly data = inject<string | null>(MAT_DIALOG_DATA);
  readonly profileName = model(this.data);

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public handleEnterKey(): void {
    this.dialogRef.close(this.profileName());
  }
}
