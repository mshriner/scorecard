import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
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
import {
  DataToShare,
  UserWithRoundsAndCourses,
} from '../../models/data-transfer';
import { LocalUserWithFilters, User } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserService } from '../../services/user.service';
import { DataUtils } from '../../util/data-utils';
import { AreYouSureDialogComponent } from '../are-you-sure-dialog/are-you-sure-dialog.component';

@Component({
  selector: 'app-profiles',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRippleModule,
    MatDividerModule,
    DecimalPipe,
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent {
  readonly profiles: WritableSignal<LocalUserWithFilters[]> = signal([]);
  readonly dialog = inject(MatDialog);
  readonly APP_NAME = APP_NAME;
  readonly CLEAR_ALL = CLEAR_ALL_APP_DATA;
  public readonly PROFILE_TABLE_COLUMNS = [
    'edit',
    'export',
    'username',
    'delete',
  ];
  public readonly localStorageUsed = computed(() => {
    if (!this.profiles()?.length) {
      return 0;
    }
    return new Blob(Object.values(localStorage)).size;
  });

  constructor(
    public appStateService: AppStateService,
    private readonly userService: UserService,
    private readonly roundService: RoundService,
    private readonly courseService: CourseService,
    private readonly sharingService: SharingService,
    private readonly snackBarService: SnackBarService,
    private readonly router: Router,
    private readonly changeDetection: ChangeDetectorRef,
  ) {
    this.appStateService.setPageTitle('Profiles');
    effect(() => {
      // this is only really needed if the user changes text size while logged in on this screen
      this.appStateService.currentUser();
      this.profiles.set(this.userService.getAllUsers());
    });
  }

  public selectProfile(selected: LocalUserWithFilters): void {
    this.appStateService.currentUser.set(selected);
    this.router.navigateByUrl(APP_ROUTES.HOME).then(() =>
      requestAnimationFrame(() => {
        if (window.navigator.onLine) {
          window.location.reload();
        } else {
          this.snackBarService.openTemporarySnackBar(
            `You are offline. If your theme is incorrect, please restart the app.`,
          );
        }
      }),
    );
  }

  public addNewProfile(): void {
    this.dialog
      .open(NewProfileDialog)
      .afterClosed()
      .subscribe((newProfileName) => {
        const sanitizedName = newProfileName?.trim();
        if (sanitizedName?.length) {
          const newProfile: User = {
            id: DataUtils.generateUUID('user'),
            name: sanitizedName,
            roundIds: [],
            courseIds: [],
            appFontScaling: 0,
          };
          this.profiles.set(this.userService.createUser(newProfile));
        }
      });
  }

  public editProfile(
    userToEdit: LocalUserWithFilters,
    $event: MouseEvent,
  ): void {
    $event.stopPropagation();
    this.dialog
      .open(EditProfileDialog, {
        data: {
          profileName: userToEdit.name,
          checkAgainstOriginalProfileName: true,
        },
      })
      .afterClosed()
      .subscribe((newProfileName) => {
        const sanitizedName = newProfileName?.trim();
        if (sanitizedName?.length) {
          userToEdit.name = sanitizedName;
          this.userService.setUser(userToEdit);
          if (this.appStateService?.currentUser()?.id === userToEdit.id) {
            this.appStateService.currentUser.set(userToEdit);
            this.changeDetection.markForCheck();
          }
          this.profiles.set(this.userService.getAllUsers());
        }
      });
  }

  public shareUserProfile(
    userToEdit: LocalUserWithFilters,
    $event: MouseEvent,
  ): void {
    $event.stopPropagation();
    this.sharingService
      .shareData({
        data: {
          user: userToEdit,
          rounds: this.roundService.getRoundsByIds(userToEdit.roundIds),
          courses: this.courseService.getCoursesByIds(userToEdit.courseIds),
        },
        objectType: 'user',
      })
      .subscribe();
  }

  public async onFileSelected(input: HTMLInputElement): Promise<boolean> {
    const file = input.files?.[0];
    if (!file?.text?.call) {
      input.value = '';
      return Promise.resolve(false);
    }
    return file.text().then(
      (uploaded) => {
        let parsed: DataToShare | null = null;
        try {
          parsed = this.sharingService.convertDTOToDomain(JSON.parse(uploaded));
        } catch (e) {
          console.error(e);
        }
        input.value = '';
        if (
          parsed?.objectType !== 'user' ||
          !(parsed?.data as UserWithRoundsAndCourses)?.rounds ||
          !(parsed?.data as UserWithRoundsAndCourses)?.courses ||
          !(parsed?.data as UserWithRoundsAndCourses)?.user
        ) {
          this.snackBarService.openTemporarySnackBar(
            'Failed to import the user profile.',
          );
          return Promise.resolve(false);
        }

        const importedUser = parsed.data as UserWithRoundsAndCourses;
        let needToChangeCourseIds = false;
        let needToChangeRoundIds = false;

        if (
          this.doesAnotherProfileHaveThisUserIdOnThisDevice(
            importedUser.user.id,
          )
        ) {
          const newUserId = DataUtils.generateUUID('user');
          importedUser.user.id = newUserId;
          needToChangeCourseIds = true;
          needToChangeRoundIds = true;
        }

        importedUser.courses.forEach((course) => {
          if (
            needToChangeCourseIds ||
            this.doesThisCourseIdExistOnThisDevice(course.id)
          ) {
            const oldCourseId = course.id;
            const newCourseId = DataUtils.generateUUID('course');
            importedUser.rounds.forEach((round) => {
              if (round.courseId === oldCourseId) {
                round.courseId = newCourseId;
              }
            });
            importedUser.user.courseIds = importedUser.user.courseIds.map(
              (courseId) => {
                if (courseId === oldCourseId) {
                  return newCourseId;
                }
                return courseId;
              },
            );
            course.id = newCourseId;
          }
        });

        importedUser.rounds.forEach((round) => {
          if (
            needToChangeRoundIds ||
            this.doesThisRoundIdExistOnThisDevice(round.id)
          ) {
            const oldRoundId = round.id;
            const newRoundId = DataUtils.generateUUID('round');
            importedUser.user.roundIds = importedUser.user.roundIds.map(
              (roundId) => {
                if (roundId === oldRoundId) {
                  return newRoundId;
                }
                return roundId;
              },
            );
            round.id = newRoundId;
          }
        });
        this.dialog
          .open(EditProfileDialog, {
            data: {
              profileName: importedUser?.user?.name || 'Imported User',
              checkAgainstOriginalProfileName: false,
            },
          })
          .afterClosed()
          .subscribe((newProfileName) => {
            const sanitizedName = newProfileName?.trim();
            if (sanitizedName?.length) {
              importedUser.user.name = sanitizedName;
              const userSaveResult = this.userService.createUser(
                importedUser.user,
              );
              if (!userSaveResult) {
                this.snackBarService.openTemporarySnackBar(
                  `Failed to import "${importedUser.user.name}".`,
                );
                return;
              }
              for (const course of importedUser.courses) {
                const saveResult = this.courseService.setCourse(course);
                if (!saveResult) {
                  this.snackBarService.openTemporarySnackBar(
                    `Failed to import course "${course.name}".`,
                  );
                  this.userService.deleteUsers([importedUser.user.id]);
                  return;
                }
              }
              const roundsSaveResult = this.roundService.saveRounds(
                importedUser.rounds,
                false,
              );
              if (!roundsSaveResult) {
                this.snackBarService.openTemporarySnackBar(
                  `Failed to import rounds for new user "${importedUser.user.name}".`,
                );
                this.userService.deleteUsers([importedUser.user.id]);
                return;
              }
              this.changeDetection.markForCheck();
              this.profiles.set(this.userService.getAllUsers());
              this.snackBarService.openTemporarySnackBar(
                `User "${importedUser.user.name}" was imported successfully.`,
              );
            }
          });

        return Promise.resolve(true);
      },
      (reject) => {
        input.value = '';
        return Promise.reject(new Error(reject));
      },
    );
  }

  private doesAnotherProfileHaveThisUserIdOnThisDevice(
    userId: string,
  ): boolean {
    return !this.userService.getAllUserIds().includes(userId);
  }

  private doesThisCourseIdExistOnThisDevice(courseId: string): boolean {
    return !!this.courseService.getCourse(courseId);
  }

  private doesThisRoundIdExistOnThisDevice(roundId: string): boolean {
    return !!this.roundService.getRoundById(roundId);
  }

  public deleteProfile(userIdToDelete: string, $event: MouseEvent): void {
    $event.stopPropagation();
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
          if (this.appStateService?.currentUser()?.id === userIdToDelete) {
            this.appStateService.currentUser.set(null);
            this.changeDetection.markForCheck();
          }
          const userToDelete = this.userService.getUser(userIdToDelete);
          this.roundService.deleteRounds(userToDelete?.roundIds);
          this.courseService.deleteCourses(userToDelete?.courseIds);
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
  readonly data = inject<{
    profileName: string;
    checkAgainstOriginalProfileName: boolean;
  }>(MAT_DIALOG_DATA);
  readonly profileName = model(this.data.profileName);
  readonly originalProfileName;

  constructor() {
    this.originalProfileName = structuredClone(this.data.profileName);
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public handleEnterKey(): void {
    this.dialogRef.close(this.profileName());
  }
}
