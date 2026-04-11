import { Injectable } from '@angular/core';
import Dexie, { type EntityTable } from 'dexie';
import { Course } from '../models/course';
import { Round } from '../models/round';
import { LocalUserWithFilters } from '../models/user';

export interface AppMetadata {
  key: string;
  value: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AppDatabase extends Dexie {
  public users!: EntityTable<LocalUserWithFilters, 'id'>;
  public courses!: EntityTable<Course, 'id'>;
  public rounds!: EntityTable<Round, 'id'>;
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
