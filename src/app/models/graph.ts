import { BestRound, RoundVariety } from './round';

export interface PerformanceGraphData {
  yAxisLabel: string;
  yValueMinOverride?: number;
  yValueMaxOverride?: number;
  percent: boolean;
  sortedDataPoints: PerformanceGraphDataPoint[];
}

export interface PerformanceGraphDataPoint {
  yValue: number | null;
  dateStringISO: string;
  roundVariety: RoundVariety;
}

export type PerformanceGraphMetric = 'greens-in-regulation' | 'scrambling';

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

export function createEmptyHoleResults(): HoleResults {
  return {
    eaglesOrBetter: 0,
    birdies: 0,
    pars: 0,
    bogeys: 0,
    doubleBogeysOrWorse: 0,
    holesPlayed: 0,
    holesPlayedWithPutts: 0,
    putts: 0,
    holesPlayedWithPuttsInFullRounds: 0,
    puttsInFullRounds: 0,
    par3sPlayed: 0,
    totalStrokesOnPar3s: 0,
    par4sPlayed: 0,
    totalStrokesOnPar4s: 0,
    par5sPlayed: 0,
    totalStrokesOnPar5s: 0,
    theoreticalBestRound: new Map(),
    inferredGreensInRegulation: 0,
    inferredHolesScramblingSuccessfully: 0,
    inferredHolesScramblingNeeded: 0,
  };
}
