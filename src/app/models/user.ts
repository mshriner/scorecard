import { CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import { RoundDTO } from './round';
import { StorageObject } from './storage-object';

export interface User extends StorageObject {
  name: string;
  roundIds: string[];
  courseIds: string[];
  appFontScaling: number;
  courseStatsFilterSelect?: string[];
  earliestDateISO?: string;
  latestDateISO?: string;
}

export interface UserDTO extends User, ExportedItem {
  courseDTOs: CourseDTO[];
  roundDTOs: RoundDTO[];
}

type USER_OBJECT_KEYS = (keyof User)[];
