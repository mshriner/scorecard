import { Course, COURSE_EXAMPLE, CourseDTO, CourseVariety } from './course';
import { ExportedItem } from './data-transfer';
import { EighteenNumbersOrNulls, NineNumbersOrNulls } from './storage-object';

export interface RoundLike {
  strokes: NineNumbersOrNulls | EighteenNumbersOrNulls;
  roundVariety: RoundVariety;
  courseId?: string;
  matchPlay?: MatchPlayDetails;
}

export type MatchPlayDetails = {
  showOpponentScores?: boolean;
  opponentStrokes?: NineNumbersOrNulls | EighteenNumbersOrNulls;
  opponentName?: string;

  /** Opponent advantage in match play is reflected in the difference in
   * handicaps between you and your opponent. For example, if you have a
   * handicap of 5 and your opponent has a handicap of 10, then you must
   * give your opponent a stroke on the 5 hardest holes during the round.
   * This array represents the holes on which you must give your opponent
   * a stroke. If your handicap is lower than your opponent's, then the
   * values in this array will be positive because the opponent will be
   * receiving strokes off their score as advantage. If your handicap is higher
   * than your opponent's, then the values in this array will be negative.
   */
  opponentAdvantage?: NineNumbersOrNulls | EighteenNumbersOrNulls;
};

export type Round = RoundLike & {
  id: string;
  dateStringISO: string;
  courseId: string;
  putts: NineNumbersOrNulls | EighteenNumbersOrNulls;
  generalNotes: string;
};

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

export const ROUND_MAXIMUM_PROPERTIES_EXAMPLE: Round = {
  id: 'id',
  dateStringISO: new Date().toISOString(),
  courseId: COURSE_EXAMPLE.id,
  strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  putts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  roundVariety: RoundVariety.EIGHTEEN,
  generalNotes: 'note',
  matchPlay: {
    opponentStrokes: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    opponentAdvantage: [
      1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1,
    ],
    opponentName: 'opponent',
    showOpponentScores: true,
  },
};

/**
 * Imported JSON objects will be considered invalid if they are missing any of the properties of this ROUND_EXAMPLE object.
 * Optional properties should not be added to this object, as they will be considered required for the purposes of validating imported JSON objects.
 */
export const ROUND_MINIMUM_PROPERTIES_EXAMPLE: Round = {
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
