import { Course, COURSE_EXAMPLE, CourseDTO, CourseVariety } from './course';
import { ExportedItem } from './data-transfer';
import {
  EighteenNumbersOrNulls,
  NineNumbersOrNulls,
  StorageObject,
} from './storage-object';

export interface RoundLike {
  strokes: NineNumbersOrNulls | EighteenNumbersOrNulls;
  roundVariety: RoundVariety;
  courseId?: string;
}

export interface Round extends RoundLike, StorageObject {
  dateStringISO: string;
  courseId: string;
  putts: NineNumbersOrNulls | EighteenNumbersOrNulls;
  generalNotes: string;
}

export interface BestRound extends RoundLike {
  course: Course;
  bestScoresRecordedDateISO: string[];
}

export interface RoundDTO extends Round, ExportedItem {}

export interface RoundWithCourseDTO extends RoundDTO {
  courseDTO: CourseDTO;
}

export enum RoundVariety {
  EIGHTEEN = 'EIGHTEEN',
  FRONT_NINE = 'FRONT_NINE',
  BACK_NINE = 'BACK_NINE',
  FULL_NINE = 'FULL_NINE',
}

export interface RoundCompletion {
  firstNineComplete: boolean;
  secondNineComplete: boolean;
  eighteenHolesComplete: boolean;
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

export const FullRoundVarietyAtCourse: Record<CourseVariety, RoundVariety> = {
  EIGHTEEN: RoundVariety.EIGHTEEN,
  NINE: RoundVariety.FULL_NINE,
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

export function compareRoundsByDateDescending(a: Round, b: Round): number {
  if (a?.dateStringISO > b?.dateStringISO) {
    return -1;
  }
  if (a?.dateStringISO < b?.dateStringISO) {
    return 1;
  }
  return 0;
}
