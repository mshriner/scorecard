import { COURSE_EXAMPLE, CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import {
  EighteenNumbersOrNulls,
  NineNumbersOrNulls,
  StorageObject,
} from './storage-object';

export interface Round extends StorageObject {
  dateStringISO: string;
  courseId: string;
  strokes: NineNumbersOrNulls | EighteenNumbersOrNulls;
  putts: NineNumbersOrNulls | EighteenNumbersOrNulls;
  roundVariety: RoundVariety;
  generalNotes: string;
}

export interface RoundDTO extends Round, ExportedItem {
  courseDTO: CourseDTO;
}

export enum RoundVariety {
  EIGHTEEN = 'EIGHTEEN',
  FRONT_NINE = 'FRONT_NINE',
  BACK_NINE = 'BACK_NINE',
  FULL_NINE = 'FULL_NINE',
}

export const DisplayRoundVariety: Record<RoundVariety, string> = {
  EIGHTEEN: 'Full round (18 holes)',
  FRONT_NINE: 'Front nine (9 holes)',
  BACK_NINE: 'Back nine (9 holes)',
  FULL_NINE: 'Full round (9 holes)',
};

export const ROUND_EXAMPLE: Round = {
  id: 'id',
  dateStringISO: new Date().toISOString(),
  courseId: COURSE_EXAMPLE.id,
  strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  putts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  roundVariety: RoundVariety.EIGHTEEN,
  generalNotes: 'note',
};

export const EMPTY_NINE_NUMBERS: NineNumbersOrNulls = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];
export const EMPTY_EIGHTEEN_NUMBERS: EighteenNumbersOrNulls = [
  ...EMPTY_NINE_NUMBERS,
  ...EMPTY_NINE_NUMBERS,
];

export const ROUND_NOTES_MAX_LENGTH = 1000;
