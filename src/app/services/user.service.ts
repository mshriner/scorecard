import { inject, Service } from '@angular/core';
import {
  LocalFilters,
  LocalUserWithFilters,
  ROUND_DATE_SORT_COL,
  User,
} from '../models/user';
import { LocalStorageService } from './local-storage.service';

@Service()
export class UserService {
  private readonly localStorageService = inject(LocalStorageService);

  public getAllUserIds(): string[] {
    return this.localStorageService.getAllUserIds();
  }

  public getAllUsers(): LocalUserWithFilters[] {
    return this.getAllUserIds()
      .map((userId) => this.getUser(userId))
      .filter((value): value is LocalUserWithFilters => !!value);
  }

  private setAllUserIds(newValue: string[]): boolean {
    return this.localStorageService.setAllUserIds(
      newValue?.filter((value) => value?.length),
    );
  }

  public getUser(userId: string): LocalUserWithFilters | null {
    return this.localStorageService.getUser(userId);
  }

  public setUser(updatedUser: LocalUserWithFilters): boolean {
    return this.localStorageService.setUser(updatedUser);
  }

  public getCurrentUser(): LocalUserWithFilters | null {
    const currentUserId = this.localStorageService.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }
    return this.getUser(currentUserId);
  }

  public setCurrentUser(newUser: LocalUserWithFilters | null): boolean {
    if (!this.localStorageService.setCurrentUserId(newUser?.id ?? null)) {
      return false;
    }
    if (!newUser) {
      return true;
    }
    return this.setUser(newUser);
  }

  public createUser(newUser: User): LocalUserWithFilters[] {
    const defaultPropertiesForNewUser: LocalFilters = {
      sortBy: ROUND_DATE_SORT_COL,
      sortDescending: true,
      homeTabIndex: 0,
    };

    // Only set default properties if they are not already present in newUser
    const userToSave: LocalUserWithFilters = { ...newUser };
    const record = userToSave as unknown as Record<string, unknown>;
    for (const key of Object.keys(defaultPropertiesForNewUser) as Array<
      keyof LocalFilters
    >) {
      const value = defaultPropertiesForNewUser[key];
      if (record[String(key)] === undefined || record[String(key)] === null) {
        record[String(key)] = value;
      }
    }

    if (this.setUser(userToSave)) {
      this.setAllUserIds([...this.getAllUserIds(), userToSave.id]);
    }
    return this.getAllUsers();
  }

  public deleteUsers(userIdsToDelete?: string[]): void {
    if (userIdsToDelete) {
      for (const userId of userIdsToDelete) {
        this.localStorageService.removeItem(userId);
      }
    }
    this.setAllUserIds(
      this.getAllUserIds().filter(
        (userId) => !userIdsToDelete?.includes(userId),
      ),
    );
  }
}
