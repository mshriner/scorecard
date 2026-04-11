import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { assert, Mocked } from 'vitest';
import { Course, CourseDTO, CourseVariety } from '../../models/course';
import { LocalStorageService } from '../../services/local-storage.service';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { TEST_LOCAL_STORAGE_SERVICE_MOCK } from '../../services/local-storage.service.spec';
import { EditCourseComponent } from './edit-course.component';

describe('EditCourseComponent', () => {
  let component: EditCourseComponent;
  let fixture: ComponentFixture<EditCourseComponent>;
  let snackBarService: Mocked<SnackBarService>;
  let sharingService: Mocked<SharingService>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = TEST_LOCAL_STORAGE_SERVICE_MOCK;
    snackBarService = {
      openTemporarySnackBar: vi.fn(),
    } as unknown as Mocked<SnackBarService>;
    sharingService = {
      convertDTOToDomain: vi.fn(),
    } as unknown as Mocked<SharingService>;

    await TestBed.configureTestingModule({
      imports: [EditCourseComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SnackBarService, useValue: snackBarService },
        { provide: SharingService, useValue: sharingService },
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should import a course successfully', async () => {
    const mockCourse: Course = {
      id: 'old-id',
      name: 'Imported Course',
      numberOfHoles: CourseVariety.NINE,
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    };
    const mockParsed: CourseDTO = {
      objectType: 'course',
      ...mockCourse,
    };
    sharingService.convertDTOToDomain.mockReturnValue({
      objectType: 'course',
      data: mockParsed,
    });

    const fileContent = JSON.stringify(mockParsed);
    const file = new File([fileContent], 'course.json', {
      type: 'application/json',
    });
    // Mock the text method on the file object
    (file.text as any) = vi.fn().mockResolvedValue(fileContent);

    const input = { files: [file] } as unknown as HTMLInputElement;

    const result = await component.onFileSelected(input);
    expect(result).toBeTruthy();
    expect(component.editingCourse.name).toBe('Imported Course');
    expect(component.imported).toBe(true);
    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Course "Imported Course" was imported successfully.',
    );
  });

  it('should show error when importing a non-course object', async () => {
    const mockParsed = { garbage1: 'yyy' } as unknown as CourseDTO;
    sharingService.convertDTOToDomain.mockReturnValue({
      objectType: 'other',
      data: mockParsed,
    } as any);

    const fileContent = JSON.stringify(mockParsed);
    const file = new File([fileContent], 'not-course.json', {
      type: 'application/json',
    });
    // Mock the text method on the file object
    (file.text as any) = vi.fn().mockResolvedValue(fileContent);

    const input = { files: [file] } as unknown as HTMLInputElement;

    await component.onFileSelected(input);

    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Failed to import the course.',
    );
  });

  it('should not import if no file is selected', async () => {
    const input = { files: [] } as unknown as HTMLInputElement;
    component.onFileSelected(input);
    expect(snackBarService.openTemporarySnackBar).not.toHaveBeenCalled();
    expect(component.imported).toBe(false);
  });

  it('should not import if file.text() fails', async () => {
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
});
