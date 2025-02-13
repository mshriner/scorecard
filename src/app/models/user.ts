import { CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import { RoundDTO } from './round';
import { StorageObject } from './storage-object';

export interface User extends StorageObject {
  name: string;
  roundIds: string[];
  courseIds: string[];
  appFontScaling: number;
}

export interface LocalUserWithFilters extends User {
  courseStatsFilterSelect?: string[];
  earliestDateISO?: string;
  latestDateISO?: string;
}

export interface UserDTO extends User, ExportedItem {
  courseDTOs: CourseDTO[];
  roundDTOs: RoundDTO[];
}

export const USER_EXAMPLE: User = {
  id: 'id',
  name: 'name',
  roundIds: ['round1'],
  courseIds: ['course1'],
  appFontScaling: 1,
};
