import { ExportedItem } from './data-transfer';
import { StorageObject } from './storage-object';

export interface Course extends StorageObject {
  name: string;
  par: number[];
}

export interface CourseDTO extends Course, ExportedItem {}

export const COURSE_EXAMPLE: Course = {
  id: 'id',
  name: 'name',
  par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};
