import { inject, Service } from '@angular/core';
import { LOCAL_STORAGE_KEYS } from '../models/constants';
import { Course } from '../models/course';
import { Round } from '../models/round';
import { assertStorageSafe } from '../models/storage-object';
import { LocalUserWithFilters } from '../models/user';
import { AppDatabase } from './app-database.service';

const RESERVED_KEYS = new Set([
  LOCAL_STORAGE_KEYS.ALL_USERS,
  LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
]);

@Service()
export class LocalStorageService {
  private readonly db = inject(AppDatabase);
  private initialized = false;

  private allUserIds: string[] = [];
  private currentUserId: string | null = null;
  private readonly userCache = new Map<string, LocalUserWithFilters>();
  private readonly courseCache = new Map<string, Course>();
  private readonly roundCache = new Map<string, Round>();

  constructor() {
    this.loadFromLegacyLocalStorage();
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.db.open();
    await this.migrateIfNeeded();
    await this.loadCaches();
    this.initialized = true;
  }

  public getAllUserIds(): string[] {
    return [...this.allUserIds];
  }

  public setAllUserIds(userIds: string[]): boolean {
    if (!Array.isArray(userIds)) {
      return false;
    }

    this.allUserIds = userIds.filter((id) => typeof id === 'string');
    void this.db.metadata
      .put({
        key: LOCAL_STORAGE_KEYS.ALL_USERS,
        value: this.allUserIds,
      })
      .catch(console.error);
    return true;
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  public setCurrentUserId(userId: string | null): boolean {
    this.currentUserId = typeof userId === 'string' ? userId : null;
    void this.db.metadata
      .put({
        key: LOCAL_STORAGE_KEYS.CURRENT_USER_ID,
        value: this.currentUserId,
      })
      .catch(console.error);
    return true;
  }

  public getUser(userId: string): LocalUserWithFilters | null {
    if (!this.userCache.has(userId)) {
      return null;
    }
    return structuredClone(this.userCache.get(userId)!);
  }

  public setUser(user: LocalUserWithFilters): boolean {
    if (!user?.id) {
      return false;
    }

    try {
      assertStorageSafe(user);
    } catch {
      return false;
    }

    const clonedUser = structuredClone(user);
    this.userCache.set(user.id, clonedUser);
    void this.db.users.put(clonedUser).catch(console.error);
    return true;
  }

  public getCourse(courseId: string): Course | null {
    if (!this.courseCache.has(courseId)) {
      return null;
    }
    return structuredClone(this.courseCache.get(courseId)!);
  }

  public setCourse(course: Course): boolean {
    if (!course?.id) {
      return false;
    }

    try {
      assertStorageSafe(course);
    } catch {
      return false;
    }

    const clonedCourse = structuredClone(course);
    this.courseCache.set(course.id, clonedCourse);
    void this.db.courses.put(clonedCourse).catch(console.error);
    return true;
  }

  public getRound(roundId: string): Round | null {
    if (!this.roundCache.has(roundId)) {
      return null;
    }
    return structuredClone(this.roundCache.get(roundId)!);
  }

  public setRound(round: Round): boolean {
    if (!round?.id) {
      return false;
    }

    try {
      assertStorageSafe(round);
    } catch {
      return false;
    }

    const clonedRound = structuredClone(round);
    this.roundCache.set(round.id, clonedRound);
    void this.db.rounds.put(clonedRound).catch(console.error);
    return true;
  }

  public removeItem(key: string): void {
    if (key === LOCAL_STORAGE_KEYS.ALL_USERS) {
      this.allUserIds = [];
      void this.db.metadata.delete(key).catch(console.error);
      localStorage.removeItem(key);
      return;
    }

    if (key === LOCAL_STORAGE_KEYS.CURRENT_USER_ID) {
      this.currentUserId = null;
      void this.db.metadata.delete(key).catch(console.error);
      localStorage.removeItem(key);
      return;
    }

    this.userCache.delete(key);
    this.courseCache.delete(key);
    this.roundCache.delete(key);

    void this.db.users.delete(key).catch(console.error);
    void this.db.courses.delete(key).catch(console.error);
    void this.db.rounds.delete(key).catch(console.error);
    localStorage.removeItem(key);
  }

  public async clear(): Promise<void> {
    this.allUserIds = [];
    this.currentUserId = null;
    this.userCache.clear();
    this.courseCache.clear();
    this.roundCache.clear();

    await Promise.all([
      this.db.users.clear(),
      this.db.courses.clear(),
      this.db.rounds.clear(),
      this.db.metadata.clear(),
    ]);

    localStorage.clear();
    console.log('cleared all app storage');
  }

  public getStorageUsageBytes(): number {
    const pieces = [
      JSON.stringify(this.allUserIds),
      JSON.stringify(this.currentUserId),
      JSON.stringify([...this.userCache.values()]),
      JSON.stringify([...this.courseCache.values()]),
      JSON.stringify([...this.roundCache.values()]),
    ];

    return pieces.reduce((total, piece) => total + new Blob([piece]).size, 0);
  }

  private async migrateIfNeeded(): Promise<void> {
    if (!localStorage.length) {
      return;
    }

    const localKeys = Object.keys(localStorage);
    const keysToMigrate = localKeys.filter(
      (key) => RESERVED_KEYS.has(key) || this.canParseLegacyKey(key),
    );
    if (!keysToMigrate.length) {
      return;
    }

    const migratedUserIds = new Set<string>();
    for (const key of keysToMigrate) {
      const rawValue = localStorage.getItem(key);
      const data = this.parseJson(rawValue);
      if (data === null || data === undefined) {
        continue;
      }

      if (key === LOCAL_STORAGE_KEYS.ALL_USERS && Array.isArray(data)) {
        this.allUserIds = data.filter((item) => typeof item === 'string');
        await this.db.metadata.put({ key, value: this.allUserIds });
      } else if (key === LOCAL_STORAGE_KEYS.CURRENT_USER_ID) {
        this.currentUserId = typeof data === 'string' ? data : null;
        await this.db.metadata.put({ key, value: this.currentUserId });
      } else if (this.isUserObject(data)) {
        this.userCache.set(key, structuredClone(data));
        migratedUserIds.add(key);
      } else if (this.isCourseObject(data)) {
        this.courseCache.set(key, structuredClone(data));
      } else if (this.isRoundObject(data)) {
        this.roundCache.set(key, structuredClone(data));
      }
    }

    if (migratedUserIds.size && !this.allUserIds.length) {
      this.allUserIds = [...migratedUserIds];
      await this.db.metadata.put({
        key: LOCAL_STORAGE_KEYS.ALL_USERS,
        value: this.allUserIds,
      });
    }

    await Promise.all([
      this.db.users.bulkPut([...this.userCache.values()]),
      this.db.courses.bulkPut([...this.courseCache.values()]),
      this.db.rounds.bulkPut([...this.roundCache.values()]),
    ]);

    for (const key of keysToMigrate) {
      localStorage.removeItem(key);
    }
  }

  private async loadCaches(): Promise<void> {
    const [users, courses, rounds, allUsersMeta, currentUserMeta] =
      await Promise.all([
        this.db.users.toArray(),
        this.db.courses.toArray(),
        this.db.rounds.toArray(),
        this.db.metadata.get(LOCAL_STORAGE_KEYS.ALL_USERS),
        this.db.metadata.get(LOCAL_STORAGE_KEYS.CURRENT_USER_ID),
      ]);

    this.userCache.clear();
    users.forEach((user) => this.userCache.set(user.id, user));

    this.courseCache.clear();
    courses.forEach((course) => this.courseCache.set(course.id, course));

    this.roundCache.clear();
    rounds.forEach((round) => this.roundCache.set(round.id, round));

    if (Array.isArray(allUsersMeta?.value)) {
      this.allUserIds = allUsersMeta.value.filter(
        (item) => typeof item === 'string',
      );
    }

    if (typeof currentUserMeta?.value === 'string') {
      this.currentUserId = currentUserMeta.value;
    }

    if (!this.allUserIds.length) {
      this.allUserIds = [...this.userCache.keys()];
    }
  }

  private loadFromLegacyLocalStorage(): void {
    const storedUserIds = this.parseJson(
      localStorage.getItem(LOCAL_STORAGE_KEYS.ALL_USERS),
    );
    if (Array.isArray(storedUserIds)) {
      this.allUserIds = storedUserIds.filter(
        (item) => typeof item === 'string',
      );
    }

    const storedCurrentUserId = this.parseJson(
      localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID),
    );
    if (typeof storedCurrentUserId === 'string') {
      this.currentUserId = storedCurrentUserId;
    }

    for (const key of Object.keys(localStorage)) {
      if (RESERVED_KEYS.has(key)) {
        continue;
      }
      const rawValue = localStorage.getItem(key);
      const data = this.parseJson(rawValue);
      if (this.isUserObject(data)) {
        this.userCache.set(key, structuredClone(data));
      } else if (this.isCourseObject(data)) {
        this.courseCache.set(key, structuredClone(data));
      } else if (this.isRoundObject(data)) {
        this.roundCache.set(key, structuredClone(data));
      }
    }

    if (!this.allUserIds.length && this.userCache.size) {
      this.allUserIds = [...this.userCache.keys()];
    }
  }

  private canParseLegacyKey(key: string): boolean {
    const value = localStorage.getItem(key);
    if (typeof value !== 'string') {
      return false;
    }
    const data = this.parseJson(value);
    return (
      this.isUserObject(data) ||
      this.isCourseObject(data) ||
      this.isRoundObject(data)
    );
  }

  private parseJson(value: string | null): any {
    if (typeof value !== 'string') {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private isUserObject(value: any): value is LocalUserWithFilters {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.id === 'string' &&
      Array.isArray(value.roundIds) &&
      Array.isArray(value.courseIds)
    );
  }

  private isCourseObject(value: any): value is Course {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.id === 'string' &&
      typeof value.name === 'string' &&
      value.par !== undefined
    );
  }

  private isRoundObject(value: any): value is Round {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.id === 'string' &&
      typeof value.courseId === 'string' &&
      Array.isArray(value.strokes)
    );
  }
}
