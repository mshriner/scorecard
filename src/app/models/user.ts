import { CourseDTO } from './course';
import { ExportedItem } from './data-transfer';
import { RoundDTO } from './round';
import { StorageObject } from './storage-object';

export enum AppTheme {
  SYSTEM,
  LIGHT,
  DARK,
}

interface UserBaseData extends StorageObject {
  name: string;
  appFontScaling: number;
  scoringGender?: GenderForScoring;
}

export type GenderForScoring = 'male' | 'female'; // I support trans rights but golf does not :(

export interface User extends UserBaseData {
  roundIds: string[];
  courseIds: string[];
}

export interface LocalFilters {
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
  graphRegression?: boolean;
}

export interface LocalUserWithFilters extends User, LocalFilters {}

export const ROUND_DATE_SORT_COL = 'roundDate';
export const ROUND_SCORE_SORT_COL = 'roundScore';
export type ResultsSorting =
  | typeof ROUND_DATE_SORT_COL
  | typeof ROUND_SCORE_SORT_COL;

export type WhenToShowPWADialogAgain = 'later' | 'never';

export interface UserProfileDTO extends ExportedItem {
  userDTO: UserBaseData;
  courseDTOs: CourseDTO[];
  roundDTOs: RoundDTO[];
}

export const USER_EXAMPLE: User = {
  id: 'id',
  name: 'name',
  roundIds: ['round1'],
  courseIds: ['course1'],
  appFontScaling: 1,
  scoringGender: 'female',
};
