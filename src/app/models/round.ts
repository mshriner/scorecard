import { COURSE_EXAMPLE, CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import { StorageObject } from './storage-object';

export interface Round extends StorageObject {
  dateStringISO: string;
  courseId: string;
  strokes: number[];
  putts: (number | null)[];
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
}

export const DisplayRoundVariety: Record<RoundVariety, string> = {
  EIGHTEEN: 'Full round (18 holes)',
  FRONT_NINE: 'Front nine (9 holes)',
  BACK_NINE: 'Back nine (9 holes)',
};

export const ROUND_EXAMPLE: Round = {
  id: 'id',
  dateStringISO: new Date().toISOString(),
  courseId: COURSE_EXAMPLE.id,
  strokes: new Array(18).fill(4),
  putts: new Array(18).fill(1),
  roundVariety: RoundVariety.EIGHTEEN,
  generalNotes: 'note',
};

export const ROUND_NOTES_MAX_LENGTH = 1000;
