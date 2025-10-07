import { CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import { RoundDTO } from './round';
import { StorageObject } from './storage-object';

export enum AppTheme {
  SYSTEM,
  LIGHT,
  DARK,
}

export interface User extends StorageObject {
  name: string;
  roundIds: string[];
  courseIds: string[];
  appFontScaling: number;
}

export interface LocalUserWithFilters extends User {
  filtersOpen?: boolean;
  courseStatsFilterSelect?: string[];
  earliestDateISO?: string;
  latestDateISO?: string;
  sortDescending?: boolean;
  sortBy?: ResultsSorting;
  homeTabIndex?: number;
  pwaPrompted?: boolean;
  newStrokesUI?: boolean;
  theme?: AppTheme;
  evenSpaceGraph?: boolean;
}

export const ROUND_DATE_SORT_COL = 'roundDate';
export const ROUND_SCORE_SORT_COL = 'roundScore';
export type ResultsSorting =
  | typeof ROUND_DATE_SORT_COL
  | typeof ROUND_SCORE_SORT_COL;

export type WhenToShowPWADialogAgain = 'later' | 'never';

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
