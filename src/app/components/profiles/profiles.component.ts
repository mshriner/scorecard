import {
  ChangeDetectorRef,
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
import {
  APP_NAME,
  APP_ROUTES,
  CLEAR_ALL_APP_DATA,
  DELETE_PROFILE,
} from '../../models/constants';
import { User } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
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
  public readonly PROFILE_TABLE_COLUMNS = ['edit', 'username', 'delete'];

  constructor(
    public appStateService: AppStateService,
    private userService: UserService,
    private roundService: RoundService,
    private couseService: CourseService,
    private router: Router,
    private changeDetection: ChangeDetectorRef,
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
        const sanitizedName = newProfileName?.trim();
        if (sanitizedName?.length) {
          const newProfile: User = {
            id: `user-${crypto.randomUUID()}`,
            name: sanitizedName,
            roundIds: [],
            courseIds: [],
            appFontScaling: 0,
          };
          this.profiles.set(this.userService.createUser(newProfile));
        }
      });
  }

  public editProfile(userToEdit: User): void {
    this.dialog
      .open(EditProfileDialog, {
        data: userToEdit.name,
      })
      .afterClosed()
      .subscribe((newProfileName) => {
        const sanitizedName = newProfileName?.trim();
        if (sanitizedName?.length) {
          userToEdit.name = sanitizedName;
          this.userService.setUser(userToEdit);
          if (this.appStateService?.currentUser?.id === userToEdit.id) {
            this.appStateService.currentUser = userToEdit;
            this.changeDetection.markForCheck();
          }
          this.profiles.set(this.userService.getAllUsers());
        }
      });
  }

  public deleteProfile(userIdToDelete: string): void {
    this.dialog
      .open(AreYouSureDialogComponent, {
        data: DELETE_PROFILE,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.profiles.set(
            this.profiles().filter((profile) => profile.id !== userIdToDelete),
          );
          if (this.appStateService?.currentUser?.id === userIdToDelete) {
            this.appStateService.currentUser = null;
            this.changeDetection.markForCheck();
          }
          const userToDelete = this.userService.getUser(userIdToDelete);
          this.roundService.deleteRounds(userToDelete?.roundIds);
          this.couseService.deleteCourses(userToDelete?.courseIds);
          this.userService.deleteUsers([userIdToDelete]);
        }
      });
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
    MatIconModule,
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

@Component({
  selector: 'edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
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
    MatIconModule,
  ],
})
export class EditProfileDialog {
  readonly dialogRef = inject(MatDialogRef<EditProfileDialog>);
  readonly data = inject<string | null>(MAT_DIALOG_DATA);
  readonly profileName = model(this.data);
  readonly originalProfileName;

  constructor() {
    this.originalProfileName = JSON.parse(JSON.stringify(this.data));
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public handleEnterKey(): void {
    this.dialogRef.close(this.profileName());
  }
}
