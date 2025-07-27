import { ExportedItem } from './data-transfer';
import { EighteenNumbers, NineNumbers, StorageObject } from './storage-object';

export interface Course extends StorageObject {
  name: string;
  /** This field can be calculated on load, and is not required for importing. */
  numberOfHoles?: CourseVariety; // required when creating a new course
  par: NineNumbers | EighteenNumbers;
}

export interface CourseDTO extends Course, ExportedItem {}

export enum CourseVariety {
  EIGHTEEN = 'EIGHTEEN',
  NINE = 'NINE',
}

export const DisplayCourseVariety: Record<CourseVariety, string> = {
  EIGHTEEN: '18 holes',
  NINE: '9 holes',
};

export const COURSE_EXAMPLE: Course = {
  id: 'id',
  name: 'name',
  numberOfHoles: CourseVariety.EIGHTEEN,
  par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
};

export const NINE_NUMBERS_ZEROED: NineNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
export const EIGHTEEN_NUMBERS_ZEROED: EighteenNumbers = [
  ...NINE_NUMBERS_ZEROED,
  ...NINE_NUMBERS_ZEROED,
];
