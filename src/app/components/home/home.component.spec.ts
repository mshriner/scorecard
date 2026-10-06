import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideZonelessChangeDetection } from '@angular/core';
import { Mocked } from 'vitest';
import { Course, CourseVariety } from '../../models/course';
import { Round, RoundVariety } from '../../models/round';
import { LocalUserWithFilters } from '../../models/user';
import { AppStateService } from '../../services/app-state.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { createLocalStorageServiceTestMock } from '../../services/local-storage.service.spec';
import { RoundService } from '../../services/round.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = createLocalStorageServiceTestMock();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should remove rounds whose course has been deleted', () => {
    const course: Course = {
      id: 'course-1',
      name: 'Test Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const round: Round = {
      id: 'round-1',
      courseId: course.id,
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      putts: [2, 2, 2, 2, 2, 2, 2, 2, 2],
      roundVariety: RoundVariety.FRONT_NINE,
      dateStringISO: '2023-01-01T00:00:00Z',
      generalNotes: '',
    };
    const staleRound: Round = {
      ...round,
      id: 'stale-round',
      courseId: 'deleted-course',
    };
    const user: LocalUserWithFilters = {
      id: 'user-1',
      name: 'Test User',
      appFontScaling: 0,
      courseIds: [course.id],
      roundIds: [round.id, 'orphaned-round'],
    };

    localStorageService.getCourse.mockImplementation((courseId) =>
      courseId === course.id ? course : null,
    );
    localStorageService.getRound.mockImplementation((roundId) =>
      roundId === round.id ? round : null,
    );
    const roundService = TestBed.inject(RoundService);
    vi.spyOn(roundService, 'deleteRounds').mockImplementation(() => {});
    component.statisticsService.filteredRounds.set([staleRound]);
    TestBed.inject(AppStateService).currentUser.set(user);

    fixture.detectChanges();

    expect(component.statisticsService.rounds()).toEqual([round]);
    expect(component.statisticsService.filteredRounds()).toEqual([round]);
    expect(roundService.deleteRounds).toHaveBeenCalledWith([
      'orphaned-round',
    ]);
    expect(TestBed.inject(AppStateService).currentUser()?.roundIds).toEqual([
      round.id,
    ]);
  });
});
