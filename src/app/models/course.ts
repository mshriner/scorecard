import { ExportedItem } from './data-transfer';
import { StorageObject } from './storage-object';

export interface Course extends StorageObject {
  name: string;
  par: number[];
}

export interface CourseDTO extends Course, ExportedItem {}

export const COURSE_EXAMPLE: CourseDTO = {
  id: 'id',
  name: 'name',
  par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  fromProfileId: 'profile-id',
  fromProfileName: 'profile-name',
};

export type CourseKeys = keyof CourseDTO;
