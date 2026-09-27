import { BestRound, RoundVariety } from './round';

export interface PerformanceGraphData {
  sortedDataPoints: PerformanceGraphDataPoint[];
  yAxisLabel: string;
  yValueMinOverride?: number;
  yValueMaxOverride?: number;
  percent?: boolean;
  scoreToPar?: boolean;
}

export interface PerformanceGraphDataPoint {
  yValue: number | null;
  date: Date;
  roundId: string;
  roundVariety: RoundVariety;
}

export type PerformanceGraphMetric =
  | 'greens-in-regulation'
  | 'scrambling-success'
  | 'putts-all'
  | 'putts-18'
  | 'score-to-par-all'
  | 'score-to-par-18'
  | 'score-on-par-3s'
  | 'score-on-par-4s'
  | 'score-on-par-5s'
  | 'zero-putt-holes'
  | 'one-putt-holes'
  | 'two-putt-holes'
  | 'three-plus-putt-holes';

export interface HoleResults {
  // score breakdown by result relative to par
  eaglesOrBetter: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeysOrWorse: number;

  // hole and putt volume totals
  holesPlayed: number;
  holesPlayedWithPutts: number;
  putts: number;
  holesPlayedWithPuttsInFullRounds: number;
  puttsInFullRounds: number;

  // putt breakdown by number of putts
  zeroPuttHoles: number;
  onePuttHoles: number;
  twoPuttHoles: number;
  threePlusPuttHoles: number;

  // completed round aggregates
  completedNinesInAllRounds: number;
  completed18HoleRounds: number;
  totalStrokesInAllCompletedRounds: number;
  totalStrokesInCompleted18HoleRounds: number;
  totalScoreToParInAllCompletedRounds: number;
  totalScoreToParInCompleted18HoleRounds: number;

  // performance by hole par value
  par3sPlayed: number;
  totalStrokesOnPar3s: number;
  par4sPlayed: number;
  totalStrokesOnPar4s: number;
  par5sPlayed: number;
  totalStrokesOnPar5s: number;

  // theoretical and inferred performance metrics
  theoreticalBestRound: Map<string, BestRound>;
  inferredGreensInRegulation: number;
  inferredHolesScramblingSuccessfully: number;
  inferredHolesScramblingNeeded: number;
}

export type GraphYValueExtractor = (results: HoleResults) => number | null;

export interface GraphDetails {
  yAxisLabel: string;
  yValueExtractor: GraphYValueExtractor;
  filterRoundsWithoutPutts?: boolean;
  percent?: boolean;
  scoreToPar?: boolean;
}

export function createEmptyHoleResults(): HoleResults {
  return {
    // score breakdown by result relative to par
    eaglesOrBetter: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeys: 0,
    tripleBogeysOrWorse: 0,

    // hole and putt volume totals
    holesPlayed: 0,
    holesPlayedWithPutts: 0,
    putts: 0,
    holesPlayedWithPuttsInFullRounds: 0,
    puttsInFullRounds: 0,

    // putt breakdown by number of putts
    zeroPuttHoles: 0,
    onePuttHoles: 0,
    twoPuttHoles: 0,
    threePlusPuttHoles: 0,

    // completed round aggregates
    completedNinesInAllRounds: 0,
    completed18HoleRounds: 0,
    totalStrokesInAllCompletedRounds: 0,
    totalStrokesInCompleted18HoleRounds: 0,
    totalScoreToParInAllCompletedRounds: 0,
    totalScoreToParInCompleted18HoleRounds: 0,

    // performance by hole par value
    par3sPlayed: 0,
    totalStrokesOnPar3s: 0,
    par4sPlayed: 0,
    totalStrokesOnPar4s: 0,
    par5sPlayed: 0,
    totalStrokesOnPar5s: 0,

    // theoretical and inferred performance metrics
    theoreticalBestRound: new Map(),
    inferredGreensInRegulation: 0,
    inferredHolesScramblingSuccessfully: 0,
    inferredHolesScramblingNeeded: 0,
  };
}

export const GRAPH_VARIETIES: Record<PerformanceGraphMetric, GraphDetails> = {
  'greens-in-regulation': {
    yAxisLabel: 'Greens in Regulation',
    percent: true,
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
  'scrambling-success': {
    yAxisLabel: 'Scrambling Success',
    percent: true,
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
  'putts-all': {
    yAxisLabel: 'Avg. Putts (Per 9 Holes)',
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return 9 * (holeResults.putts / holeResults.holesPlayedWithPutts);
    },
  },
  'putts-18': {
    yAxisLabel: 'Putts (18-Hole Rounds)',
    yValueExtractor: (holeResults) => {
      if (
        !holeResults.completed18HoleRounds ||
        !holeResults.holesPlayedWithPuttsInFullRounds
      ) {
        return null;
      }
      return (
        18 *
        (holeResults.puttsInFullRounds /
          holeResults.holesPlayedWithPuttsInFullRounds)
      );
    },
  },
  'score-on-par-3s': {
    yAxisLabel: 'Avg. Score on Par 3s',
    yValueExtractor: (holeResults) => {
      if (!holeResults.par3sPlayed) {
        return null;
      }
      return holeResults.totalStrokesOnPar3s / holeResults.par3sPlayed;
    },
  },
  'score-on-par-4s': {
    yAxisLabel: 'Avg. Score on Par 4s',
    yValueExtractor: (holeResults) => {
      if (!holeResults.par4sPlayed) {
        return null;
      }
      return holeResults.totalStrokesOnPar4s / holeResults.par4sPlayed;
    },
  },
  'score-on-par-5s': {
    yAxisLabel: 'Avg. Score on Par 5s',
    yValueExtractor: (holeResults) => {
      if (!holeResults.par5sPlayed) {
        return null;
      }
      return holeResults.totalStrokesOnPar5s / holeResults.par5sPlayed;
    },
  },
  'score-to-par-all': {
    yAxisLabel: 'Avg. Score to Par (Per 9 Holes)',
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
  'zero-putt-holes': {
    yAxisLabel: '0-Putt Holes',
    filterRoundsWithoutPutts: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return holeResults.zeroPuttHoles;
    },
  },
  'one-putt-holes': {
    yAxisLabel: '1-Putt Holes',
    filterRoundsWithoutPutts: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return holeResults.onePuttHoles;
    },
  },
  'two-putt-holes': {
    yAxisLabel: '2-Putt Holes',
    filterRoundsWithoutPutts: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return holeResults.twoPuttHoles;
    },
  },
  'three-plus-putt-holes': {
    yAxisLabel: '3+ Putt Holes',
    filterRoundsWithoutPutts: true,
    yValueExtractor: (holeResults) => {
      if (!holeResults.holesPlayedWithPutts) {
        return null;
      }
      return holeResults.threePlusPuttHoles;
    },
  },
};
