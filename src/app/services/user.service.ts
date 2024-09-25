import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { User } from '../models/user';
import { STORAGE_KEYS } from '../models/constants';

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

  public getAllUsers(): User[] {
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

  public getUser(userId: string): User | null {
    const retrieved = this.localStorageService.getItem(userId);
    if (!retrieved?.id) {
      return null;
    }
    return retrieved as User;
  }

  public setUser(updatedUser: User): boolean {
    return this.localStorageService.setItem(updatedUser?.id, updatedUser);
  }

  public getCurrentUser(): User | null {
    const currentUserId = this.localStorageService.getItem(
      STORAGE_KEYS.CURRENT_USER_ID,
    );
    if (!currentUserId) {
      return null;
    }
    return this.getUser(currentUserId);
  }

  public setCurrentUser(newUser: User | null): boolean {
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

  public createUser(newUser: User): User[] {
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
