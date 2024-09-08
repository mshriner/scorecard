import { StorageObject } from './storage-object';

export interface Round extends StorageObject {
  dateStringISO: string;
  title?: string;
  courseId: string;
  strokes: number[];
  putts: number[];
  roundVariety: RoundVariety;
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
