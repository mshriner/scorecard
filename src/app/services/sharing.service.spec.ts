import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Course, CourseDTO, CourseVariety } from '../models/course';
import { RoundWithCourse } from '../models/data-transfer';
import { Round, RoundDTO, RoundVariety } from '../models/round';
import { DataUtils } from '../util/data-utils';
import { AppStateService } from './app-state.service';
import { SharingService } from './sharing.service';
import { SnackBarService } from './snack-bar.service';

describe('SharingService', () => {
  let service: SharingService;
  let appStateServiceSpy: any;
  let snackBarServiceSpy: any;

  beforeEach(() => {
    appStateServiceSpy = {
      currentUser: jasmine
        .createSpy('currentUser')
        .and.returnValue({ id: 'u1', name: 'User One' }),
    };
    snackBarServiceSpy = {
      openTemporarySnackBar: jasmine.createSpy('openTemporarySnackBar'),
    };

    TestBed.configureTestingModule({
      providers: [
        SharingService,
        { provide: AppStateService, useValue: appStateServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(SharingService);
    spyOn(DataUtils, 'generateUUID').and.returnValue('uuid-test');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sanitize an imported CourseDTO object by removing extraneous properties', () => {
    const rawCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
      extraField: 'should be removed', // extraneous property
    } as any; // Cast to any to include extra fields

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('course');
    const course: Course = result!.data as Course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)'); // Name appended in parseCourse
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).extraField).toBeUndefined();
  });

  it('should reject an imported CourseDTO object with par.length !== 9 or 18', () => {
    const rawCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      numberOfHoles: CourseVariety.NINE,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
    } as any;

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).toBeNull();
  });

  it('should accept an imported CourseDTO object with par.length === 9 and numberOfHoles not provided', () => {
    const rawNineHoleCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
    } as any;

    const result = service.convertDTOToDomain(rawNineHoleCourseDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('course');
    const course: Course = result!.data as Course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)'); // Name appended in parseCourse
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(course.numberOfHoles).toEqual(CourseVariety.NINE);
  });

  it('should accept an imported CourseDTO object with par.length === 18 and numberOfHoles not provided', () => {
    const rawNineHoleCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
    } as any;

    const result = service.convertDTOToDomain(rawNineHoleCourseDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('course');
    const course: Course = result!.data as Course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)'); // Name appended in parseCourse
    expect(course.par).toEqual([
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    ]);
    expect(course.numberOfHoles).toEqual(CourseVariety.EIGHTEEN);
  });

  it('should sanitize an imported RoundDTO object by removing extraneous properties', () => {
    const rawRoundDTO: RoundDTO = {
      id: 'round1',
      dateStringISO: '2023-01-01T00:00:00Z',
      courseId: 'course1',
      strokes: new Array(18).fill(4),
      putts: new Array(18).fill(1),
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: 'Test round',
      courseDTO: {
        id: 'course1',
        name: 'Test Course',
        par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        fromProfileId: 'ignore',
        fromProfileName: 'ignore',
        objectType: 'course',
        extraField: 'should be removed', // extraneous property in course
      } as any,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'round',
      extraField: 'should be removed', // extraneous property in round
    } as any;

    const result = service.convertDTOToDomain(rawRoundDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('round');
    const roundWithCourse: RoundWithCourse = result!.data as RoundWithCourse;
    const round: Round = roundWithCourse.round;
    expect(round.dateStringISO).toBe('2023-01-01T00:00:00Z');
    expect(round.courseId).toBe('course1');
    expect(round.strokes).toEqual(new Array(18).fill(4));
    expect(round.putts).toEqual(new Array(18).fill(1));
    expect(round.roundVariety).toBe(RoundVariety.EIGHTEEN);
    expect(round.generalNotes).toBe('Test round (imported)'); // Name appended in parseCourse
    expect((round as any).extraField).toBeUndefined();
    // Validate the embedded course
    const course: Course = roundWithCourse.course;
    expect(course.id).toBe('course1');
  });

  it('should sanitize an imported CourseDTO object by removing extraneous properties', () => {
    const rawCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
      extraField: 'should be removed', // extraneous property
    } as any; // Cast to any to include extra fields

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('course');
    const course: Course = result!.data as Course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)');
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).extraField).toBeUndefined();
  });

  it('should return null when required fields are missing in CourseDTO', () => {
    // Missing par field, which is required per COURSE_EXAMPLE
    const rawCourseDTO: CourseDTO = {
      id: 'course2',
      name: 'Incomplete Course',
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
    } as any;

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).toBeNull();
  });

  it('should return null when required fields are malformed in CourseDTO', () => {
    // Invalid number of holes, which is required per COURSE_EXAMPLE
    const rawCourseDTO: CourseDTO = {
      id: 'course2',
      name: 'Incomplete Course',
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
      par: [2, 3, 4, 5], // Invalid par length
    } as any;

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).toBeNull();
  });

  it('should ignore additional unknown properties in CourseDTO', () => {
    // Test with multiple extraneous properties
    const rawCourseDTO: CourseDTO = {
      id: 'course3',
      name: 'Extra Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'course',
      randomProp1: 'remove me',
      randomProp2: 123,
    } as any;

    const result = service.convertDTOToDomain(rawCourseDTO);
    expect(result).not.toBeNull();
    const course: Course = result!.data as Course;
    expect(course.id).toBe('course3');
    expect(course.name).toBe('Extra Course (imported)');
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).randomProp1).toBeUndefined();
    expect((course as any).randomProp2).toBeUndefined();
  });

  it('should sanitize an imported RoundDTO object by removing extraneous properties', () => {
    const rawRoundDTO: RoundDTO = {
      id: 'round1',
      dateStringISO: '2023-01-01T00:00:00Z',
      courseId: 'course1',
      strokes: new Array(18).fill(4),
      putts: new Array(18).fill(1),
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: 'Test round',
      courseDTO: {
        id: 'course1',
        name: 'Test Course',
        par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        fromProfileId: 'ignore',
        fromProfileName: 'ignore',
        objectType: 'course',
        extraField: 'should be removed', // extraneous property in course
      } as any,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'round',
      extraField: 'should be removed', // extraneous property in round
    } as any;

    const result = service.convertDTOToDomain(rawRoundDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('round');
    const roundWithCourse: RoundWithCourse = result!.data as RoundWithCourse;
    const round: Round = roundWithCourse.round;
    expect(round.dateStringISO).toBe('2023-01-01T00:00:00Z');
    expect(round.courseId).toBe('course1');
    expect(round.strokes).toEqual(new Array(18).fill(4));
    expect(round.putts).toEqual(new Array(18).fill(1));
    expect(round.roundVariety).toBe(RoundVariety.EIGHTEEN);
    expect(round.generalNotes).toBe('Test round (imported)'); // Name appended in parseCourse
    expect((round as any).extraField).toBeUndefined();

    // Validate the embedded course
    const course: Course = roundWithCourse.course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)');
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).extraField).toBeUndefined();
    // Check that round ID was replaced using DataUtils.generateUUID
    expect(round.id).toBe('uuid-test');
  });

  it('should return null if required fields are missing in the imported RoundDTO (missing course par)', () => {
    // Create a RoundDTO missing required field in courseDTO (par)
    const rawRoundDTO: RoundDTO = {
      id: 'round2',
      dateStringISO: '2023-01-01T00:00:00Z',
      courseId: 'course1',
      strokes: new Array(18).fill(4),
      putts: new Array(18).fill(1),
      roundVariety: RoundVariety.EIGHTEEN,
      generalNotes: 'Test round with missing course.par',
      courseDTO: {
        id: 'course1',
        name: 'Test Course',
        // Missing par field
        fromProfileId: 'ignore',
        fromProfileName: 'ignore',
        objectType: 'course',
      } as any,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundDTO);
    expect(result).toBeNull();
  });

  it('should return null if required fields are missing in the RoundDTO itself', () => {
    // Missing required field in roundDTO (e.g., strokes)
    const rawRoundDTO: RoundDTO = {
      id: 'round3',
      dateStringISO: '2023-01-01T00:00:00Z',
      courseId: 'course1',
      // strokes: new Array(18).fill(4),
      putts: new Array(18).fill(1),
      roundVariety: RoundVariety.EIGHTEEN,
      // Missing generalNotes
      courseDTO: {
        id: 'course1',
        name: 'Test Course',
        par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        fromProfileId: 'ignore',
        fromProfileName: 'ignore',
        objectType: 'course',
      } as any,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundDTO);
    expect(result).toBeNull();
  });

  it('should create Round if only generalNotes is missing in the RoundDTO itself', () => {
    // Missing required field in roundDTO (e.g., generalNotes)
    const rawRoundDTO: RoundDTO = {
      id: 'round3',
      dateStringISO: '2023-01-01T00:00:00Z',
      courseId: 'course1',
      strokes: new Array(18).fill(4),
      putts: new Array(18).fill(1),
      roundVariety: RoundVariety.EIGHTEEN,
      // Missing generalNotes
      courseDTO: {
        id: 'course1',
        name: 'Test Course',
        par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        fromProfileId: 'ignore',
        fromProfileName: 'ignore',
        objectType: 'course',
      } as any,
      fromProfileId: 'ignore',
      fromProfileName: 'ignore',
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundDTO);
    expect(result).not.toBeNull();
    expect(result!.objectType).toBe('round');
    const roundWithCourse: RoundWithCourse = result!.data as RoundWithCourse;
    const round: Round = roundWithCourse.round;
    expect(round.dateStringISO).toBe('2023-01-01T00:00:00Z');
    expect(round.courseId).toBe('course1');
    expect(round.strokes).toEqual(new Array(18).fill(4));
    expect(round.putts).toEqual(new Array(18).fill(1));
    expect(round.roundVariety).toBe(RoundVariety.EIGHTEEN);
    expect(round.generalNotes).toBe('(imported)'); // Name appended in parseCourse
    expect((round as any).extraField).toBeUndefined();

    // Validate the embedded course
    const course: Course = roundWithCourse.course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)');
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).extraField).toBeUndefined();
    // Check that round ID was replaced using DataUtils.generateUUID
    expect(round.id).toBe('uuid-test');
  });
});
