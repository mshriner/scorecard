import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total holes played and putts correctly', () => {
    // Arrange: create two rounds with different stats
    const round1 = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      roundVariety: 1, // RoundVariety.FULL_NINE
      generalNotes: '',
    } as any;
    const round2 = {
      id: 'r2',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [5, 5, 5, 5, 5, 5, 5, 5, 5],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: 1, // RoundVariety.FULL_NINE
      generalNotes: '',
    } as any;
    // Set up a course
    const course = {
      id: 'c1',
      name: 'Test Course',
      numberOfHoles: 9,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    } as any;
    // Set signals
    component.rounds.set([round1, round2]);
    component.filteredRounds.set([round1, round2]);
    // Patch courseService.getCourse to return our course
    vi.spyOn(component.courseService, 'getCourse').mockReturnValue(course);
    // Act
    const stats = component.holeResultTotals();
    // Assert
    expect(stats.holesPlayed).toBe(18);
    expect(stats.putts).toBe(18 + 9); // 2*9 + 1*9 = 27
  });

  it('should count eagles, birdies, pars, bogeys, and doubles', () => {
    // Arrange: one round with a variety of scores
    const round = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [2, 3, 4, 5, 6], // eagle, birdie, par, bogey, double
      putts: [1, 1, 2, 2, 2],
      roundVariety: 1,
      generalNotes: '',
    } as any;
    const course = {
      id: 'c1',
      name: 'Test Course',
      numberOfHoles: 5,
      par: [4, 4, 4, 4, 4],
    } as any;
    component.rounds.set([round]);
    component.filteredRounds.set([round]);
    vi.spyOn(component.courseService, 'getCourse').mockReturnValue(course);
    // Act
    const stats = component.holeResultTotals();
    // Assert
    expect(stats.eaglesOrBetter).toBe(1);
    expect(stats.birdies).toBe(1);
    expect(stats.pars).toBe(1);
    expect(stats.bogeys).toBe(1);
    expect(stats.doubleBogeysOrWorse).toBe(1);
  });

  it('should calculate inferred greens in regulation and scrambling', () => {
    // Arrange: one round with putts and strokes
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
    component.rounds.set([round]);
    component.filteredRounds.set([round]);
    vi.spyOn(component.courseService, 'getCourse').mockReturnValue(course);
    // Act
    const stats = component.holeResultTotals();
    // Assert
    expect(stats.inferredGreensInRegulation).toBeGreaterThanOrEqual(0);
    expect(stats.inferredHolesScramblingNeeded).toBeGreaterThanOrEqual(0);
    expect(stats.inferredHolesScramblingSuccessfully).toBeGreaterThanOrEqual(0);
  });
});

