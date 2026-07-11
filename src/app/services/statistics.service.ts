import {
  computed,
  inject,
  Service,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Course, CourseVariety, NINE_NUMBERS_ZEROED } from '../models/course';
import { createEmptyHoleResults, HoleResults } from '../models/graph';
import {
  EMPTY_EIGHTEEN_NUMBERS,
  EMPTY_NINE_NUMBERS,
  Round,
  RoundCompletion,
  RoundVariety,
} from '../models/round';
import { CourseService } from './course.service';

@Service()
export class StatisticsService {
  private readonly courseService = inject(CourseService);

  public rounds: WritableSignal<Round[]> = signal([]);
  public filteredRounds: WritableSignal<Round[]> = signal([]);

  public courseMap: Signal<Map<string, Course | null>> = computed(() => {
    const map: Map<string, Course | null> = new Map();
    for (const round of this.rounds()) {
      if (!map.has(round.courseId)) {
        const course = this.courseService.getCourse(round.courseId);
        map.set(round.courseId, course);
      }
    }
    return map;
  });

  public holeResultTotals: Signal<HoleResults> = computed(() => {
    const holeResults: HoleResults = createEmptyHoleResults();
    if (!this.filteredRounds()?.length) {
      return holeResults;
    }
    for (const round of this.filteredRounds()) {
      this.processHoles(round, holeResults);
    }
    return holeResults;
  });

  public coursesWithHoleResults: Signal<string[]> = computed(() => {
    return Array.from(this.holeResultTotals().theoreticalBestRound.keys()).sort(
      (a, b) => a.localeCompare(b),
    );
  });

  /**
   * @returns whether there is a course associated with this round (should always be true)
   */
  public processHoles(round: Round, holeResults: HoleResults, courseOverride?: Course | null): boolean {
    const course = courseOverride || this.courseMap().get(round.courseId);
    if (!course) {
      return false;
    }
    const roundSegmentsComplete = this.calculateRoundCompletion(round);
    holeResults.completed18HoleRounds +=
      +roundSegmentsComplete.eighteenHolesComplete;
    holeResults.completedNinesInAllRounds +=
      +roundSegmentsComplete.firstNineComplete +
      +roundSegmentsComplete.secondNineComplete;
    for (let index = 0; index < round.strokes.length; index++) {
      this.processHoleResult(
        holeResults,
        round,
        course,
        index,
        roundSegmentsComplete,
      );
    }
    return true;
  }

  private calculateRoundCompletion(round: Round): RoundCompletion {
    const strokes = round?.strokes ?? [];
    const firstNine =
      strokes.slice(0, 9).length === 9
        ? strokes.slice(0, 9)
        : NINE_NUMBERS_ZEROED;
    const secondNine =
      strokes.slice(9, 18).length === 9
        ? strokes.slice(9, 18)
        : NINE_NUMBERS_ZEROED;

    const firstNineComplete = !firstNine.some((stroke) => !stroke);
    const secondNineComplete = !secondNine.some((stroke) => !stroke);

    return {
      firstNineComplete,
      secondNineComplete,
      eighteenHolesComplete: firstNineComplete && secondNineComplete,
    };
  }

  private processHoleResult(
    holeResults: HoleResults,
    round: Round,
    course: Course,
    index: number,
    roundSegmentsComplete: RoundCompletion,
  ): void {
    const strokes = round.strokes[index];
    if (!strokes) {
      return;
    }

    this.updateTheoreticalBestRound(
      holeResults,
      course,
      index,
      strokes,
      round.dateStringISO,
    );

    holeResults.holesPlayed++;
    const parOnHole = course?.par[index] ?? 0;
    const holeResultToPar = strokes - parOnHole;

    this.updateParStats(
      holeResults,
      holeResultToPar,
      parOnHole,
      strokes,
      index,
      roundSegmentsComplete,
    );

    if (round.putts[index] || round.putts[index] === 0) {
      holeResults.holesPlayedWithPutts++;
      const putts = round.putts[index];
      holeResults.putts += putts;
      if (strokes - putts <= parOnHole - 2) {
        holeResults.inferredGreensInRegulation++;
      } else {
        holeResults.inferredHolesScramblingNeeded++;
        if (strokes <= parOnHole) {
          holeResults.inferredHolesScramblingSuccessfully++;
        }
      }
      if (round.roundVariety === RoundVariety.EIGHTEEN) {
        holeResults.holesPlayedWithPuttsInFullRounds++;
        holeResults.puttsInFullRounds += putts;
      }
    }
  }

  private updateTheoreticalBestRound(
    holeResults: HoleResults,
    course: Course,
    index: number,
    strokes: number,
    dateStringISO: string,
  ): void {
    if (!holeResults.theoreticalBestRound.has(course.id)) {
      switch (course.numberOfHoles) {
        case CourseVariety.NINE: {
          holeResults.theoreticalBestRound.set(course.id, {
            roundVariety: RoundVariety.FULL_NINE,
            strokes: [...EMPTY_NINE_NUMBERS],
            course: course,
            bestScoresRecordedDateISO: new Array<string>(9),
          });
          break;
        }
        case CourseVariety.EIGHTEEN:
        default: {
          holeResults.theoreticalBestRound.set(course.id, {
            roundVariety: RoundVariety.EIGHTEEN,
            strokes: [...EMPTY_EIGHTEEN_NUMBERS],
            course: course,
            bestScoresRecordedDateISO: new Array<string>(18),
          });
          break;
        }
      }
    }
    const theoreticalBestRound = holeResults.theoreticalBestRound.get(
      course.id,
    );
    if (
      theoreticalBestRound &&
      (theoreticalBestRound.strokes[index] || Infinity) > strokes
    ) {
      theoreticalBestRound.strokes[index] = strokes;
      theoreticalBestRound.bestScoresRecordedDateISO[index] = dateStringISO;
    }
  }

  private updateParStats(
    holeResults: HoleResults,
    holeResultToPar: number,
    parOnHole: number,
    strokes: number,
    index: number,
    roundSegmentsComplete: RoundCompletion,
  ): void {
    switch (parOnHole) {
      case 3: {
        holeResults.par3sPlayed++;
        holeResults.totalStrokesOnPar3s += strokes;
        break;
      }
      case 4: {
        holeResults.par4sPlayed++;
        holeResults.totalStrokesOnPar4s += strokes;
        break;
      }
      case 5: {
        holeResults.par5sPlayed++;
        holeResults.totalStrokesOnPar5s += strokes;
        break;
      }
    }

    const addHoleToAllCompletedRoundTotals =
      roundSegmentsComplete.eighteenHolesComplete ||
      (index < 9 && roundSegmentsComplete.firstNineComplete) ||
      (index >= 9 && roundSegmentsComplete.secondNineComplete);

    if (holeResultToPar <= -2) {
      holeResults.eaglesOrBetter++;
    } else if (holeResultToPar === -1) {
      holeResults.birdies++;
    } else if (holeResultToPar === 0) {
      holeResults.pars++;
    } else if (holeResultToPar === 1) {
      holeResults.bogeys++;
    } else if (holeResultToPar === 2) {
      holeResults.doubleBogeys++;
    } else if (holeResultToPar >= 3) {
      holeResults.tripleBogeysOrWorse++;
    }

    if (addHoleToAllCompletedRoundTotals) {
      holeResults.totalScoreToParInAllCompletedRounds += holeResultToPar;
      holeResults.totalStrokesInAllCompletedRounds += strokes;
    }
    if (roundSegmentsComplete.eighteenHolesComplete) {
      holeResults.totalScoreToParInCompleted18HoleRounds += holeResultToPar;
      holeResults.totalStrokesInCompleted18HoleRounds += strokes;
    }
  }
}
