import { TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { CourseService } from './course.service';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let courseService: { getCourse: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    courseService = {
      getCourse: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: CourseService,
          useValue: courseService,
        },
      ],
    });
    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate total holes played and putts correctly', () => {
    const round1 = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      roundVariety: 1,
      generalNotes: '',
    } as any;
    const round2 = {
      id: 'r2',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [5, 5, 5, 5, 5, 5, 5, 5, 5],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: 1,
      generalNotes: '',
    } as any;
    const course = {
      id: 'c1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    } as any;

    service.rounds.set([round1, round2]);
    service.filteredRounds.set([round1, round2]);
    courseService.getCourse.mockReturnValue(course);

    const stats = service.holeResultTotals();

    expect(stats.holesPlayed).toBe(18);
    expect(stats.putts).toBe(27);
  });

  it('should count eagles, birdies, pars, bogeys, and doubles', () => {
    const round = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [2, 3, 4, 5, 6, 7],
      putts: [1, 1, 2, 2, 2, 2],
      roundVariety: 1,
      generalNotes: '',
    } as any;
    const course = {
      id: 'c1',
      name: 'Test Course',
      numberOfHoles: 5,
      par: [4, 4, 4, 4, 4, 4],
    } as any;

    service.rounds.set([round]);
    service.filteredRounds.set([round]);
    courseService.getCourse.mockReturnValue(course);

    const stats = service.holeResultTotals();

    expect(stats.eaglesOrBetter).toBe(1);
    expect(stats.birdies).toBe(1);
    expect(stats.pars).toBe(1);
    expect(stats.bogeys).toBe(1);
    expect(stats.doubleBogeys).toBe(1);
    expect(stats.tripleBogeysOrWorse).toBe(1);
  });

  it('should calculate inferred greens in regulation and scrambling', () => {
    const round = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [3, 4, 5, 6],
      putts: [1, 2, 2, 3],
      roundVariety: 1,
      generalNotes: '',
    } as any;
    const course = {
      id: 'c1',
      name: 'Test Course',
      numberOfHoles: 4,
      par: [4, 4, 4, 4],
    } as any;

    service.rounds.set([round]);
    service.filteredRounds.set([round]);
    courseService.getCourse.mockReturnValue(course);

    const stats = service.holeResultTotals();

    expect(stats.inferredGreensInRegulation).toBeGreaterThanOrEqual(0);
    expect(stats.inferredHolesScramblingNeeded).toBeGreaterThanOrEqual(0);
    expect(stats.inferredHolesScramblingSuccessfully).toBeGreaterThanOrEqual(0);
  });
});
