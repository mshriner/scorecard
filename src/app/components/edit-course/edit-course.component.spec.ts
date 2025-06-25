import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Course, CourseDTO, CourseVariety } from '../../models/course';
import { SharingService } from '../../services/sharing.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { EditCourseComponent } from './edit-course.component';

describe('EditCourseComponent', () => {
  let component: EditCourseComponent;
  let fixture: ComponentFixture<EditCourseComponent>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;
  let sharingService: jasmine.SpyObj<SharingService>;

  beforeEach(async () => {
    snackBarService = jasmine.createSpyObj('SnackBarService', [
      'openTemporarySnackBar',
    ]);
    sharingService = jasmine.createSpyObj('SharingService', [
      'convertDTOToDomain',
    ]);

    await TestBed.configureTestingModule({
      imports: [EditCourseComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideAnimationsAsync(),
        { provide: SnackBarService, useValue: snackBarService },
        { provide: SharingService, useValue: sharingService },
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
      fromProfileId: 'user-id',
      fromProfileName: 'user',
      ...mockCourse,
    };
    sharingService.convertDTOToDomain.and.returnValue({
      objectType: 'course',
      data: mockParsed,
    });

    const fileContent = JSON.stringify(mockParsed);
    const file = new File([fileContent], 'course.json', {
      type: 'application/json',
    });
    spyOn(file, 'text').and.returnValue(Promise.resolve(fileContent));

    const input = {
      files: [file],
    } as unknown as HTMLInputElement;

    const result = await component.onFileSelected(input);
    expect(result).toBeTruthy();
    expect(component.editingCourse.name).toBe('Imported Course');
    expect(component.imported).toBeTrue();
    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Course "Imported Course" was imported successfully.',
    );
  });

  it('should show error when importing a non-course object', async () => {
    const mockParsed = { garbage1: 'yyy' } as unknown as CourseDTO;
    sharingService.convertDTOToDomain.and.returnValue({
      objectType: 'other',
      data: mockParsed,
    } as any);

    const fileContent = JSON.stringify(mockParsed);
    const file = new File([fileContent], 'not-course.json', {
      type: 'application/json',
    });
    spyOn(file, 'text').and.returnValue(Promise.resolve(fileContent));

    const input = {
      files: [file],
    } as unknown as HTMLInputElement;

    await component.onFileSelected(input);

    expect(snackBarService.openTemporarySnackBar).toHaveBeenCalledWith(
      'Failed to import the course.',
    );
  });

  it('should not import if no file is selected', async () => {
    const input = { files: [] } as unknown as HTMLInputElement;
    component.onFileSelected(input);
    expect(snackBarService.openTemporarySnackBar).not.toHaveBeenCalled();
    expect(component.imported).toBeFalse();
  });

  it('should not import if file.text() fails', async () => {
    const file = new File([''], 'bad.json', { type: 'application/json' });
    spyOn(file, 'text').and.returnValue(Promise.reject(new Error('error')));
    const input = { files: [file] } as unknown as HTMLInputElement;

    // Suppress console error for this test
    spyOn(console, 'log');

    try {
      await component.onFileSelected(input);
    } catch (ignored) {
      expect(ignored).toBeInstanceOf(Error);
      expect(snackBarService.openTemporarySnackBar).not.toHaveBeenCalled();
      expect(component.imported).toBeFalse();
      return;
    }
    fail('should have rejected');
  });
});
