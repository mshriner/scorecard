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
import { APP_ROUTES } from '../../models/constants';
import { User } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';
import { UserService } from '../../services/user.service';

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
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent {
  readonly profiles: WritableSignal<User[]> = signal([]);
  readonly dialog = inject(MatDialog);

  constructor(
    public appStateService: AppStateService,
    private userService: UserService,
    private router: Router
  ) {
    this.appStateService.setPageTitle('Profiles');
    this.profiles.set(this.userService.getAllUsers());
  }

  public selectProfile(selected: User): void {
    this.appStateService.currentUser = selected;
    this.router.navigateByUrl('/home');
  }

  public addNewProfile(): void {
    const dialogRef = this.dialog.open(NewProfileDialog);

    dialogRef.afterClosed().subscribe((newProfileName) => {
      console.log('The dialog was closed');
      if (newProfileName !== undefined) {
        const newProfile: User = {
          id: `user-${crypto.randomUUID()}`,
          name: newProfileName,
          roundIds: [],
          courseIds: [],
        };
        this.profiles.set([...this.profiles(), newProfile]);
        this.userService.setUser(newProfile);
        this.saveProfileList();
      }
    });
  }

  public deleteProfile(idToDelete: string): void {
    this.profiles.set(
      this.profiles().filter((profile) => profile.id !== idToDelete)
    );
    this.saveProfileList();
  }

  private saveProfileList(): void {
    this.userService.setAllUserIds(
      this.profiles().map((profile) => profile.id)
    );
  }

  public reload(): void {
    window.location.reload();
  }

  public clearAllData(): void {
    this.router.navigateByUrl(APP_ROUTES.CLEAR_DATA);
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
