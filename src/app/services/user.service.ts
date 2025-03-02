import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../models/constants';
import { LocalUserWithFilters } from '../models/user';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private localStorageService: LocalStorageService) {}

  public getAllUserIds(): string[] {
    const retrieved = this.localStorageService.getItem(STORAGE_KEYS.ALL_USERS);
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
      STORAGE_KEYS.ALL_USERS,
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
      STORAGE_KEYS.CURRENT_USER_ID,
    );
    if (!currentUserId) {
      return null;
    }
    return this.getUser(currentUserId);
  }

  public setCurrentUser(newUser: LocalUserWithFilters | null): boolean {
    if (
      !this.localStorageService.setItem(
        STORAGE_KEYS.CURRENT_USER_ID,
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
    if (this.setUser(newUser)) {
      this.setAllUserIds([...this.getAllUserIds(), newUser.id]);
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
