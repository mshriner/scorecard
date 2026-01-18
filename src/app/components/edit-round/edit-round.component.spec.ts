import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
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
  let snackBarService: SnackBarService;
  let sharingService: SharingService;
  let courseService: CourseService;
  let roundService: RoundService;
  let appStateService: AppStateService;

  beforeEach(async () => {
    snackBarService = {
      openTemporarySnackBar: vi.fn(),
    };
    sharingService = {
      convertDTOToDomain: vi.fn(),
    };
    courseService = {
      getAllCoursesForCurrentUser: vi.fn(),
      getCourse: vi.fn(),
      setCourse: vi.fn(),
    };
    roundService = {
      getRoundById: vi.fn(),
      saveRounds: vi.fn(),
      deleteRounds: vi.fn(),
    };

    appStateService = {
      currentUser: vi.fn(),
      setPageTitle: vi.fn(),
      useSmallerButtons: vi.fn(),
    };

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
    expect(component.currentCourse?.name).toBe('Imported Course');
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
    component.currentCourse = course;
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
    component.currentCourse = course;
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
    fail('should have rejected');
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
    component.currentCourse = {
      id: 'c5',
      name: 'Eighteen Hole',
      numberOfHoles: CourseVariety.EIGHTEEN,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    expect(component.showSummaryRow(8)).toBe(true);
  });

  it('should return false for showSummaryRow at index 8 for 9-hole course', () => {
    component.currentCourse = {
      id: 'c6',
      name: 'Nine Hole',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    expect(component.showSummaryRow(8)).toBe(false);
  });

  it('should return true from returnTrue()', () => {
    expect(component.returnTrue()).toBe(true);
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

  it('should disable save button if required fields are missing', () => {
    component.editingRound = {
      id: 'r6',
      dateStringISO: '',
      courseId: '',
      strokes: [] as any,
      putts: [] as any,
      roundVariety: null as any,
      generalNotes: '',
    };
    expect(component.disableSaveButton).toBe(true);
  });
});
