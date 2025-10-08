import { Injectable } from '@angular/core';
import { LOCAL_STORAGE_KEYS } from '../models/constants';
import {
  LocalFilters,
  LocalUserWithFilters,
  ROUND_DATE_SORT_COL,
} from '../models/user';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private readonly localStorageService: LocalStorageService) {}

  public getAllUserIds(): string[] {
    const retrieved = this.localStorageService.getItem(
      LOCAL_STORAGE_KEYS.ALL_USERS,
    );
    if (!Array.isArray(retrieved)) {
      return [];
    }
    return retrieved as string[];
  }

  public getAllUsers(): LocalUserWithFilters[] {
    return this.getAllUserIds()
      .map((userId) => this.getUser(userId))
      .filter((value) => !!value);
  }

  private setAllUserIds(newValue: string[]): boolean {
    return this.localStorageService.setItem(
      LOCAL_STORAGE_KEYS.ALL_USERS,
      newValue?.filter((value) => value?.length),
    );
  }

  public getUser(userId: string): LocalUserWithFilters | null {
    const retrieved = this.localStorageService.getItem(userId);
    if (!retrieved?.id) {
      return null;
    }
    return retrieved as LocalUserWithFilters;
  }

  public setUser(updatedUser: LocalUserWithFilters): boolean {
    return this.localStorageService.setItem(updatedUser?.id, updatedUser);
  }

  public getCurrentUser(): LocalUserWithFilters | null {
    const currentUserId = this.localStorageService.getItem(
      LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
    );
    if (!currentUserId) {
      return null;
    }
    return this.getUser(currentUserId);
  }

  public setCurrentUser(newUser: LocalUserWithFilters | null): boolean {
    if (
      !this.localStorageService.setItem(
        LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
        newUser?.id ?? null,
      )
    ) {
      return false;
    }
    if (!newUser) {
      return true;
    }
    return this.setUser(newUser);
  }

  public createUser(newUser: LocalUserWithFilters): LocalUserWithFilters[] {
    const defaultPropertiesForNewUser: LocalFilters = {
      sortBy: ROUND_DATE_SORT_COL,
      sortDescending: true,
      homeTabIndex: 0,
      newStrokesUI: true,
    };

    // Only set default properties if they are not already present in newUser
    const userToSave = { ...newUser };
    Object.entries(defaultPropertiesForNewUser).forEach(([key, value]) => {
      if (userToSave[key] === undefined || userToSave[key] === null) {
        userToSave[key] = value;
      }
    });

    if (this.setUser(userToSave)) {
      this.setAllUserIds([...this.getAllUserIds(), userToSave.id]);
    }
    return this.getAllUsers();
  }

  public deleteUsers(userIdsToDelete?: string[]): void {
    userIdsToDelete?.forEach((userId) =>
      this.localStorageService.removeItem(userId),
    );
    this.setAllUserIds(
      this.getAllUserIds().filter(
        (userId) => !userIdsToDelete?.includes(userId),
      ),
    );
  }
}
