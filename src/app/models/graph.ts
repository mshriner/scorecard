import { BestRound, RoundVariety } from './round';

export interface PerformanceGraphData {
  yAxisLabel: string;
  yValueMinOverride?: number;
  yValueMaxOverride?: number;
  percent: boolean;
  scoreToPar: boolean;
  sortedDataPoints: PerformanceGraphDataPoint[];
}

export interface PerformanceGraphDataPoint {
  yValue: number | null;
  date: Date;
  roundId: string;
  roundVariety: RoundVariety;
}

export type PerformanceGraphMetric =
  | 'greens-in-regulation'
  | 'scrambling'
  | 'strokes-all'
  | 'strokes-18'
  | 'score-to-par-all'
  | 'score-to-par-18';

export interface HoleResults {
  eaglesOrBetter: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeysOrWorse: number;
  holesPlayed: number;
  holesPlayedWithPutts: number;
  putts: number;
  holesPlayedWithPuttsInFullRounds: number;
  puttsInFullRounds: number;
  completedNinesInAllRounds: number;
  completed18HoleRounds: number;
  totalStrokesInAllCompletedRounds: number;
  totalStrokesInCompleted18HoleRounds: number;
  totalScoreToParInAllCompletedRounds: number;
  totalScoreToParInCompleted18HoleRounds: number;
  par3sPlayed: number;
  totalStrokesOnPar3s: number;
  par4sPlayed: number;
  totalStrokesOnPar4s: number;
  par5sPlayed: number;
  totalStrokesOnPar5s: number;
  theoreticalBestRound: Map<string, BestRound>;
  inferredGreensInRegulation: number;
  inferredHolesScramblingSuccessfully: number;
  inferredHolesScramblingNeeded: number;
}

export type GraphYValueExtractor = (results: HoleResults) => number | null;

export interface GraphDetails {
  yAxisLabel: string;
  percent: boolean;
  scoreToPar: boolean;
  yValueExtractor: GraphYValueExtractor;
}

export function createEmptyHoleResults(): HoleResults {
  return {
    // splits by result to par
    eaglesOrBetter: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeysOrWorse: 0,

    // total holes vs holes with putts
    holesPlayed: 0,
    holesPlayedWithPutts: 0,
    putts: 0,
    holesPlayedWithPuttsInFullRounds: 0,
    puttsInFullRounds: 0,

    // splits by hole par
    par3sPlayed: 0,
    totalStrokesOnPar3s: 0,
    par4sPlayed: 0,
    totalStrokesOnPar4s: 0,
    par5sPlayed: 0,
    totalStrokesOnPar5s: 0,

    // theoretical best round
    theoreticalBestRound: new Map(),

    // inferred stats (putts needed)
    inferredGreensInRegulation: 0,
    inferredHolesScramblingSuccessfully: 0,
    inferredHolesScramblingNeeded: 0,

    // stats for completed rounds
    completedNinesInAllRounds: 0,
    completed18HoleRounds: 0,
    totalStrokesInAllCompletedRounds: 0,
    totalStrokesInCompleted18HoleRounds: 0,
    totalScoreToParInAllCompletedRounds: 0,
    totalScoreToParInCompleted18HoleRounds: 0,
  };
}

export const GRAPH_VARIETIES: Record<PerformanceGraphMetric, GraphDetails> = {
  'greens-in-regulation': {
    yAxisLabel: 'Greens in Regulation',
    percent: true,
    scoreToPar: false,
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return (
        holeResults.inferredGreensInRegulation /
        holeResults.holesPlayedWithPutts
      );
    },
  },
  scrambling: {
    yAxisLabel: 'Scrambling Success',
    percent: true,
    scoreToPar: false,
    yValueExtractor: (holeResults) => {
      if (!holeResults.inferredHolesScramblingNeeded) {
        return null;
      }
      return (
        holeResults.inferredHolesScramblingSuccessfully /
        holeResults.inferredHolesScramblingNeeded
      );
    },
  },
  'strokes-all': {
    yAxisLabel: 'Strokes (All Rounds)',
    percent: false,
    scoreToPar: false,
    yValueExtractor: (holeResults) => {
      if (!holeResults.completedNinesInAllRounds) {
        return null;
      }
      return (
        holeResults.totalStrokesInAllCompletedRounds /
        holeResults.completedNinesInAllRounds
      );
    },
  },
  'strokes-18': {
    yAxisLabel: 'Strokes (18-Hole Rounds)',
    percent: false,
    scoreToPar: false,
    yValueExtractor: (holeResults) => {
      if (!holeResults.completed18HoleRounds) {
        return null;
      }
      return (
        holeResults.totalStrokesInCompleted18HoleRounds /
        holeResults.completed18HoleRounds
      );
    },
  },
  'score-to-par-all': {
    yAxisLabel: 'Score to Par (All Rounds)',
    percent: false,
    scoreToPar: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.completedNinesInAllRounds) {
        return null;
      }
      return (
        holeResults.totalScoreToParInAllCompletedRounds /
        holeResults.completedNinesInAllRounds
      );
    },
  },
  'score-to-par-18': {
    yAxisLabel: 'Score to Par (18-Hole Rounds)',
    percent: false,
    scoreToPar: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.completed18HoleRounds) {
        return null;
      }
      return (
        holeResults.totalScoreToParInCompleted18HoleRounds /
        holeResults.completed18HoleRounds
      );
    },
  },
};
