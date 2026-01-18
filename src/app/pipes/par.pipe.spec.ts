import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RoundVariety } from '../models/round';
import { ParPipe } from './par.pipe';
import { RoundVarietyScoresPipe } from './round-variety-scores.pipe';

describe('ParPipe', () => {
  let component: ParPipe;
  let roundVarietyScoresPipe: RoundVarietyScoresPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ParPipe,
        RoundVarietyScoresPipe,
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    roundVarietyScoresPipe = TestBed.inject(RoundVarietyScoresPipe);
    component = TestBed.inject(ParPipe);
  });

  it('create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate round score', () => {
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it('should calculate par for a full 9-hole course', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    } as any;
    const result = component.transform(mockCourse);
    expect(result).toBe(36);
  });

  it('should calculate par for a full 18-hole course', () => {
    const mockCourse = {
      id: '2',
      name: 'Test Course 2',
      numberOfHoles: 18,
      par: Array(18).fill(4),
    } as any;
    const result = component.transform(mockCourse);
    expect(result).toBe(72);
  });

  it('should calculate par for front nine only', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 18,
      par: Array(18).fill(4),
    } as any;
    const mockRound = { roundVariety: RoundVariety.FRONT_NINE } as any;
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      4, 4, 4, 4, 4, 4, 4, 4, 4,
    ]);
    const result = component.transform(
      mockCourse,
      mockRound,
      RoundVariety.FRONT_NINE,
    );
    expect(result).toBe(36);
  });

  it('should calculate par for back nine only', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 18,
      par: Array(18).fill(4),
    } as any;
    const mockRound = { roundVariety: RoundVariety.BACK_NINE } as any;
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      4, 4, 4, 4, 4, 4, 4, 4, 4,
    ]);
    const result = component.transform(
      mockCourse,
      mockRound,
      RoundVariety.BACK_NINE,
    );
    expect(result).toBe(36);
  });

  it('should handle nulls and zeros in par array', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [4, null, 4, 0, 4, null, 4, 4, 4],
    } as any;
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      4,
      null,
      4,
      0,
      4,
      null,
      4,
      4,
      4,
    ]);
    const result = component.transform(mockCourse);
    expect(result).toBe(24);
  });

  it('should return 0 if par array is empty or undefined', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [],
    } as any;
    // Provide an array of the correct length with all zeros
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const result = component.transform(mockCourse);
    expect(result).toBe(0);
  });

  it('should use roundVariety from round if half is not provided', () => {
    const mockCourse = {
      id: '1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    } as any;
    const mockRound = { roundVariety: RoundVariety.FRONT_NINE } as any;
    vi.spyOn(roundVarietyScoresPipe, 'transform').mockReturnValue([
      4, 4, 4, 4, 4, 4, 4, 4, 4,
    ]);
    const result = component.transform(mockCourse, mockRound);
    expect(result).toBe(36);
  });
});
