import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { assert, describe, expect, it, Mocked, vi } from 'vitest';
import { SNACKBAR_MESSAGES } from '../../models/constants';
import { Course, CourseVariety } from '../../models/course';
import { Round, RoundVariety } from '../../models/round';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { RoundService } from '../../services/round.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { EditRoundComponent } from './edit-round.component';

describe('EditRoundComponent', () => {
  let component: EditRoundComponent;
  let fixture: ComponentFixture<EditRoundComponent>;
  let snackBarService: Mocked<SnackBarService>;
  let sharingService: Mocked<SharingService>;
  let courseService: Mocked<CourseService>;
  let roundService: Mocked<RoundService>;
  let appStateService: Mocked<AppStateService>;

  beforeEach(async () => {
    snackBarService = {
      openTemporarySnackBar: vi.fn(),
      _snackBar: {} as any,
    } as unknown as Mocked<SnackBarService>;
    sharingService = {
      shareData: vi.fn(),
      convertDomainToDTO: vi.fn(),
      convertDTOToDomain: vi.fn(),
    } as unknown as Mocked<SharingService>;
    courseService = {
      getAllCoursesForCurrentUser: vi.fn(),
      getCourse: vi.fn(),
      setCourse: vi.fn(),
    } as unknown as Mocked<CourseService>;
    roundService = {
      getRoundById: vi.fn(),
      saveRounds: vi.fn(),
      deleteRounds: vi.fn(),
    } as unknown as Mocked<RoundService>;

    appStateService = {
      currentUser: vi.fn(),
      setPageTitle: vi.fn(),
      useSmallerButtons: vi.fn(),
    } as unknown as Mocked<AppStateService>;

    // Create a function to act as the signal
    const unsavedDataSignal = (() => unsavedDataSignal.value) as any;
    unsavedDataSignal.value = false;
    unsavedDataSignal.set = vi.fn();
    // Optionally, add .bind if needed
    unsavedDataSignal.bind = Function.prototype.bind;

    // Assign the function as the property
    (appStateService as any).unsavedDataOnPage = unsavedDataSignal;

    courseService.getAllCoursesForCurrentUser.mockReturnValue([]);
    appStateService.currentUser.mockReturnValue({
      courseIds: [],
      roundIds: [],
      name: 'test',
      appFontScaling: 2,
      id: 'id',
    });

    await TestBed.configureTestingModule({
      imports: [EditRoundComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SnackBarService, useValue: snackBarService },
        { provide: SharingService, useValue: sharingService },
        { provide: CourseService, useValue: courseService },
        { provide: RoundService, useValue: roundService },
        { provide: AppStateService, useValue: appStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should import a round successfully', async () => {
    const mockCourse: Course = {
      id: 'course-id',
      name: 'Imported Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockRound: Round = {
      id: 'round-id',
      dateStringISO: new Date().toISOString(),
      courseId: 'course-id',
      strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: 'Imported round',
    };
    const mockParsed: any = {
      objectType: 'round',
      data: { round: mockRound, course: mockCourse },
    };
    sharingService.convertDTOToDomain.mockReturnValue(mockParsed);

    const fileContent = JSON.stringify({
      objectType: 'round',
      ...mockRound,
      courseDTO: mockCourse,
    });
    const file = new File([fileContent], 'round.json', {
      type: 'application/json',
    });
    // Mock the text method on the file object
    (file.text as any) = vi.fn().mockResolvedValue(fileContent);

    const input = { files: [file] } as unknown as HTMLInputElement;

    // Mock getCourse to return undefined so it triggers needToSaveImportedCourse
    courseService.getCourse.mockReturnValue(undefined as any);

    await component.onFileSelected(input);

    expect(component.editingRound.id).toBe('round-id');
    expect(component.imported).toBe(true);
    expect(component.currentCourse()?.name).toBe('Imported Course');
    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Round at "Imported Course" was imported successfully.',
    );
  });

  it('should show error when importing a non-round object', async () => {
    const mockParsed: any = { objectType: 'other', data: {} };
    sharingService.convertDTOToDomain.mockReturnValue(mockParsed);

    const fileContent = JSON.stringify(mockParsed);
    const file = new File([fileContent], 'not-round.json', {
      type: 'application/json',
    });
    // Mock the text method on the file object
    (file.text as any) = vi.fn().mockResolvedValue(fileContent);

    const input = { files: [file] } as unknown as HTMLInputElement;

    await component.onFileSelected(input);

    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Failed to import the round.',
    );
    expect(component.imported).toBe(false);
  });

  it('should not import if no file is selected', async () => {
    const input = { files: [] } as unknown as HTMLInputElement;
    component.onFileSelected(input);
    expect(snackBarService.openTemporarySnackBar).not.toHaveBeenCalled();
    expect(component.imported).toBe(false);
  });

  it('should update current course and round variety for nine hole course', () => {
    const course: Course = {
      id: 'c1',
      name: 'Nine Hole',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    courseService.getCourse.mockReturnValue(course);
    component.currentCourse.set(course);
    component.editingRound = {
      id: 'r1',
      dateStringISO: new Date().toISOString(),
      courseId: 'c1',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
    };
    component.updateCurrentCourse('c1');
    expect(component.editingRound.roundVariety).toBe(RoundVariety.FULL_NINE);
  });

  it('should update current course and round variety for eighteen hole course', () => {
    const course: Course = {
      id: 'c2',
      name: 'Eighteen Hole',
      numberOfHoles: CourseVariety.EIGHTEEN,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    courseService.getCourse.mockReturnValue(course);
    component.currentCourse.set(course);
    component.editingRound = {
      id: 'r2',
      dateStringISO: new Date().toISOString(),
      courseId: 'c2',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    component.updateCurrentCourse('c2');
    expect(component.editingRound.roundVariety).toBe(RoundVariety.FRONT_NINE);
  });

  it('should handle file.text() rejection gracefully', async () => {
    const file = new File([''], 'bad.json', { type: 'application/json' });
    // Mock the text method on the file object to reject
    (file.text as any) = vi.fn().mockRejectedValue(new Error('error'));
    const input = { files: [file] } as unknown as HTMLInputElement;

    // Suppress console error for this test
    vi.spyOn(console, 'log');

    try {
      await component.onFileSelected(input);
    } catch (ignored) {
      expect(ignored).toBeInstanceOf(Error);
      expect(snackBarService.openTemporarySnackBar).not.toHaveBeenCalled();
      expect(component.imported).toBe(false);
      return;
    }
    assert.fail('should have rejected');
  });

  it('should update round variety', () => {
    component.editingRound = {
      id: 'r3',
      dateStringISO: new Date().toISOString(),
      courseId: 'c3',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    component.updateRoundVariety(RoundVariety.BACK_NINE);
    expect(component.editingRound.roundVariety).toBe(RoundVariety.BACK_NINE);
  });

  it('should increment and decrement strokes and putts', () => {
    component.editingRound = {
      id: 'r4',
      dateStringISO: new Date().toISOString(),
      courseId: 'c4',
      strokes: [null, null, null, null, null, null, null, null, null],
      putts: [null, null, null, null, null, null, null, null, null],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    component.strokesPlusOne(0);
    expect(component.editingRound.strokes[0]).toBe(1);
    component.strokesMinusOne(0);
    expect(component.editingRound.strokes[0]).toBeNull();
    component.puttsPlusOne(1);
    expect(component.editingRound.putts[1]).toBe(0);
    component.puttsPlusOne(1);
    expect(component.editingRound.putts[1]).toBe(1);
    component.puttsMinusOne(1);
    expect(component.editingRound.putts[1]).toBe(0);
    component.puttsMinusOne(1);
    expect(component.editingRound.putts[1]).toBeNull();
  });

  it('should return true for showSummaryRow at index 8 for 18-hole course', () => {
    component.currentCourse.set({
      id: 'c5',
      name: 'Eighteen Hole',
      numberOfHoles: CourseVariety.EIGHTEEN,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    });
    expect(component.showSummaryRow(8)).toBe(true);
  });

  it('should return false for showSummaryRow at index 8 for 9-hole course', () => {
    component.currentCourse.set({
      id: 'c6',
      name: 'Nine Hole',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    });
    expect(component.showSummaryRow(8)).toBe(false);
  });

  it('should return true from returnTrue()', () => {
    expect(component.returnTrue()).toBe(true);
  });

  it('should show stroke markers and match indicators for net score comparison', () => {
    component.editingRound = {
      id: 'r-match-indicator',
      dateStringISO: new Date().toISOString(),
      courseId: 'c-match',
      strokes: [4, 5, 3, 0, 0, 0, 0, 0, 0],
      putts: [1, 2, 1, 0, 0, 0, 0, 0, 0],
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
      matchPlay: {
        opponentStrokes: [5, 4, 4, 0, 0, 0, 0, 0, 0],
        opponentAdvantage: [-1, 0, 1, 0, 0, 0, 0, 0, 0],
        opponentName: 'Opponent',
        showOpponentScores: true,
      },
    };

    expect(component.getStrokeCountForHole(0)).toBe(1);
    expect(component.getStrokeCountForHole(2)).toBe(1);
    expect(component.getMatchIndicator(0)).toBe('right');
    expect(component.getMatchIndicator(1)).toBe('left');
    expect(component.getMatchIndicator(2)).toBe('=');
  });

  it('should mark which player gets strokes and which player wins each hole', () => {
    component.editingRound = {
      id: 'r-match',
      dateStringISO: new Date().toISOString(),
      courseId: 'c-match',
      strokes: [4, 5, 3, 0, 0, 0, 0, 0, 0],
      putts: [1, 2, 1, 0, 0, 0, 0, 0, 0],
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: '',
      matchPlay: {
        opponentStrokes: [5, 4, 4, 0, 0, 0, 0, 0, 0],
        opponentAdvantage: [-1, 0, 1, 0, 0, 0, 0, 0, 0],
        opponentName: 'Opponent',
        showOpponentScores: true,
      },
    };

    expect(component.getMatchIndicator(0)).toBe('right');
    expect(component.getMatchIndicator(1)).toBe('left');
    expect(component.getMatchIndicator(2)).toBe('=');
    expect(component.getMatchStatusText()).toBe('AS');
  });

  it('should update date on dateChanged()', () => {
    component.editingRound = {
      id: 'r5',
      dateStringISO: '',
      courseId: 'c7',
      strokes: [] as any,
      putts: [] as any,
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    const date = new Date();
    component.dateChanged({ value: date } as any);
    expect(component.editingRound.dateStringISO).toBe(date.toISOString());
  });

  it('should disable save button if no changes to save', () => {
    (appStateService as any).unsavedDataOnPage.value = false;
    component.editingRound = {
      id: 'r6',
      dateStringISO: new Date().toISOString(),
      courseId: 'c6',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.disableSaveButton.result).toBe(true);
    expect(component.disableSaveButton.reason).toBe(
      SNACKBAR_MESSAGES.NO_CHANGES_TO_SAVE,
    );
  });

  it('should disable save button if date is invalid', () => {
    (appStateService as any).unsavedDataOnPage.value = true;
    component.editingRound = {
      id: 'r7',
      dateStringISO: 'invalid-date',
      courseId: 'c7',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.disableSaveButton.result).toBe(true);
    expect(component.disableSaveButton.reason).toBe(
      SNACKBAR_MESSAGES.DATE_REQUIRED,
    );
  });

  it('should disable save button if round variety is missing', () => {
    (appStateService as any).unsavedDataOnPage.value = true;
    component.editingRound = {
      id: 'r8',
      dateStringISO: new Date().toISOString(),
      courseId: 'c8',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: null as any,
      generalNotes: '',
    };
    expect(component.disableSaveButton.result).toBe(true);
    expect(component.disableSaveButton.reason).toBe(
      SNACKBAR_MESSAGES.ROUND_VARIETY_REQUIRED,
    );
  });

  it('should disable save button if course is not selected', () => {
    (appStateService as any).unsavedDataOnPage.value = true;
    component.editingRound = {
      id: 'r9',
      dateStringISO: new Date().toISOString(),
      courseId: '',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.disableSaveButton.result).toBe(true);
    expect(component.disableSaveButton.reason).toBe(
      SNACKBAR_MESSAGES.COURSE_REQUIRED,
    );
  });

  it('should enable save button if all required fields are valid', () => {
    (appStateService as any).unsavedDataOnPage.value = true;
    component.editingRound = {
      id: 'r10',
      dateStringISO: new Date().toISOString(),
      courseId: 'c10',
      strokes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      roundVariety: RoundVariety.FULL_NINE,
      generalNotes: '',
    };
    expect(component.disableSaveButton.result).toBe(false);
    expect(component.disableSaveButton.reason).toBe('');
  });
});
