import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Course, CourseVariety } from '../models/course';
import { Round, RoundVariety } from '../models/round';
import { CourseService } from '../services/course.service';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';
import { ScoreToParPipe } from './score-to-par.pipe';

describe('ScoreToParPipe', () => {
  let component: ScoreToParPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;
  let courseService: CourseService;

  beforeEach(async () => {
    const courseServiceSpy = {
      getCourse: vi.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        ScoreToParPipe,
        RoundVarietyScoresPipe,
        { provide: CourseService, useValue: courseServiceSpy },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    courseService = TestBed.inject(CourseService);
    component = TestBed.inject(ScoreToParPipe);
  });

  it('create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate round score as even (E)', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    const result = component.transform(mockRound);
    expect(result).toBe('E');
  });

  it('should calculate round score as over par (+)', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [5, 5, 5, 5, 5, 5, 5, 5, 5],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    vi.spyOn(courseService, 'getCourse').mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);

    const result = component.transform(mockRound);
    expect(result).toBe('+9');
  });

  it('should calculate round score as under par (-)', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [3, 3, 3, 3, 3, 3, 3, 3, 3],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      -1, -1, -1, -1, -1, -1, -1, -1, -1,
    ]);

    const result = component.transform(mockRound);
    expect(result).toBe('-9');
  });

  it('should throw an error if course is not found', () => {
    const mockRound: Round = {
      courseId: '999',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(null);

    expect(() => component.transform(mockRound)).toThrowError(
      'course with ID 999 not found',
    );
  });

  it('should calculate score for partial round variety', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [5, 4, 3, 5, 4, 3, 5, 4, 3],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      1, 0, -1, 1, 0, -1, 1, 0, -1,
    ]);

    const result = component.transform(
      mockRound,
      mockCourse,
      RoundVariety.FRONT_NINE,
    );
    expect(result).toBe('E');
  });

  it('should calculate round score as over par (+)', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [5, 4, 3, 5, 4, 3, 5, 4, 3],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]);

    const result = component.transform(mockRound);
    expect(result).toBe('+9');
  });

  it('should calculate round score as under par (-)', () => {
    const mockCourse: Course = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      courseId: '1',
      strokes: [3, 3, 3, 3, 3, 3, 3, 3, 3],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(mockCourse);
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      -1, -1, -1, -1, -1, -1, -1, -1, -1,
    ]);

    const result = component.transform(mockRound);
    expect(result).toBe('-9');
  });

  it('should throw an error if course is not found', () => {
    const mockRound: Round = {
      courseId: '999',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      generalNotes: 'Test round',
      id: 'r1',
    };

    courseService.getCourse.mockReturnValue(null);

    expect(() => component.transform(mockRound)).toThrowError(
      'course with ID 999 not found',
    );
  });
});
