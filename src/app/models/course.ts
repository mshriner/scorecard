import { ExportedItem } from './data-transfer';
import { EighteenNumbers, NineNumbers, StorageObject } from './storage-object';

export interface Course extends StorageObject {
  name: string;
  par: NineNumbers | EighteenNumbers;
}

export interface CourseDTO extends Course, ExportedItem {}

export const COURSE_EXAMPLE: Course = {
  id: 'id',
  name: 'name',
  par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

export const NINE_NUMBERS_ZEROED: NineNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
export const EIGHTEEN_NUMBERS_ZEROED: EighteenNumbers = [
  ...NINE_NUMBERS_ZEROED,
  ...NINE_NUMBERS_ZEROED,
];
