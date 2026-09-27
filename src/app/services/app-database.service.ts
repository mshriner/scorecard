import { Service } from '@angular/core';
import Dexie, { type EntityTable } from 'dexie';
import { Course } from '../models/course';
import { Round } from '../models/round';
import { StorageObject } from '../models/storage-object';
import { LocalUserWithFilters } from '../models/user';

export interface AppMetadata {
  key: string;
  value: string[] | string | null;
}

type StorageContainer<
  T extends StorageObject,
  K extends keyof T = keyof T,
> = EntityTable<T, K>;

@Service()
export class AppDatabase extends Dexie {
  public users!: StorageContainer<LocalUserWithFilters, 'id'>;
  public courses!: StorageContainer<Course, 'id'>;
  public rounds!: StorageContainer<Round, 'id'>;
  public metadata!: EntityTable<AppMetadata, 'key'>;

  constructor() {
    super('ScorecardDatabase');

    this.version(1).stores({
      users: 'id',
      courses: 'id',
      rounds: 'id, courseId',
      metadata: 'key',
    });
  }
}
