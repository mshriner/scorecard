import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Course, CourseDTO, CourseVariety } from '../models/course';
import {
  DataToShare,
  RoundWithCourse,
  UserWithRoundsAndCourses,
} from '../models/data-transfer';
import { Round, RoundVariety, RoundWithCourseDTO } from '../models/round';
import { UserProfileDTO } from '../models/user';
import { DataUtils } from '../util/data-utils';
import { SharingService } from './sharing.service';
import { SnackBarService } from './snack-bar.service';

describe('SharingService', () => {
  let service: SharingService;
  let snackBarServiceSpy: any;

  beforeEach(() => {
    snackBarServiceSpy = {
      openTemporarySnackBar: jasmine.createSpy('openTemporarySnackBar'),
    };

    TestBed.configureTestingModule({
      providers: [
        SharingService,
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        provideExperimentalZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(SharingService);
    spyOn(DataUtils, 'generateUUID').and.returnValue('uuid-test');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should reject an imported CourseDTO object with par.length !== 9 or 18', () => {
    const rawCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      numberOfHoles: CourseVariety.NINE,
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

  it('should sanitize an imported CourseDTO object by removing extraneous properties', () => {
    const rawCourseDTO: CourseDTO = {
      id: 'course1',
      name: 'Test Course',
      par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
      fromProfileId: 'ignore', // extraneous property
      fromProfileName: 'ignore', // extraneous property
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

  it('should return null when required fields are missing in CourseDTO', () => {
    // Missing par field, which is required per COURSE_EXAMPLE
    const rawCourseDTO: CourseDTO = {
      id: 'course2',
      name: 'Incomplete Course',
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
      fromProfileId: 'ignore', // extraneous property in course
      fromProfileName: 'ignore', // extraneous property in course
      objectType: 'course',
      randomProp1: 'remove me', // extraneous property in course
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
    expect((course as any).fromProfileId).toBeUndefined();
    expect((course as any).fromProfileName).toBeUndefined();
  });

  it('should sanitize an imported RoundWithCourseDTO object by removing extraneous properties', () => {
    const rawRoundWithCourseDTO: RoundWithCourseDTO = {
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
        fromProfileId: 'ignore', // extraneous property in course
        fromProfileName: 'ignore', // extraneous property in course
        objectType: 'course',
        extraField: 'should be removed', // extraneous property in course
      } as any,
      fromProfileId: 'ignore', // extraneous property in round
      fromProfileName: 'ignore', // extraneous property in round
      objectType: 'round',
      extraField: 'should be removed', // extraneous property in round
    } as any;

    const result = service.convertDTOToDomain(rawRoundWithCourseDTO);
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
    expect((round as any).fromProfileId).toBeUndefined();
    expect((round as any).fromProfileName).toBeUndefined();

    // Validate the embedded course
    const course: Course = roundWithCourse.course;
    expect(course.id).toBe('course1');
    expect(course.name).toBe('Test Course (imported)');
    expect(course.par).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect((course as any).extraField).toBeUndefined();
    expect((course as any).fromProfileId).toBeUndefined();
    expect((course as any).fromProfileName).toBeUndefined();
    // Check that round ID was replaced using DataUtils.generateUUID
    expect(round.id).toBe('uuid-test');
  });

  it('should return null if required fields are missing in the imported RoundWithCourseDTO (missing course par)', () => {
    // Create a RoundWithCourseDTO missing required field in courseDTO (par)
    const rawRoundWithCourseDTO: RoundWithCourseDTO = {
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
        objectType: 'course',
      } as any,
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundWithCourseDTO);
    expect(result).toBeNull();
  });

  it('should return null if required fields are missing in the RoundWithCourseDTO itself', () => {
    // Missing required field in roundDTO (e.g., strokes)
    const rawRoundWithCourseDTO: RoundWithCourseDTO = {
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
        objectType: 'course',
      } as any,
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundWithCourseDTO);
    expect(result).toBeNull();
  });

  it('should create Round if only generalNotes is missing in the RoundWithCourseDTO itself', () => {
    // Missing required field in roundDTO (e.g., generalNotes)
    const rawRoundWithCourseDTO: RoundWithCourseDTO = {
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
        objectType: 'course',
      } as any,
      objectType: 'round',
    } as any;

    const result = service.convertDTOToDomain(rawRoundWithCourseDTO);
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

  it('should convert UserWithRoundsAndCourses to UserProfileDTO correctly', () => {
    const user = {
      id: 'user1',
      name: 'Test User',
      appFontScaling: 1.2,
      roundIds: ['r1', 'r2'],
      courseIds: ['c1', 'c2'],
      extraField: 'should be removed',
    } as any;

    const rounds = [
      {
        id: 'r1',
        dateStringISO: '2023-01-01T00:00:00Z',
        courseId: 'c1',
        strokes: new Array(18).fill(4),
        putts: new Array(18).fill(1),
        roundVariety: RoundVariety.EIGHTEEN,
        generalNotes: 'Round 1',
      } as any,
      {
        id: 'r2',
        dateStringISO: '2023-01-02T00:00:00Z',
        courseId: 'c2',
        strokes: new Array(9).fill(3),
        putts: new Array(9).fill(2),
        roundVariety: RoundVariety.FULL_NINE,
        generalNotes: 'Round 2',
      } as any,
    ];

    const courses = [
      {
        id: 'c1',
        name: 'Course 1',
        par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
        numberOfHoles: CourseVariety.NINE,
      } as any,
      {
        id: 'c2',
        name: 'Course 2',
        par: new Array(18).fill(4),
        numberOfHoles: CourseVariety.EIGHTEEN,
      } as any,
    ];

    const dataToShare: DataToShare = {
      objectType: 'user',
      data: {
        user,
        rounds,
        courses,
      },
    };

    const result = service.convertDomainToDTO(dataToShare);

    expect(result).toBeTruthy();
    expect(result!.objectType).toBe('user');
    expect((result as any).extraField).toBeUndefined();

    const userResult = result as UserProfileDTO;
    expect(userResult).toEqual(
      jasmine.objectContaining({
        userDTO: {
          id: 'user1',
          name: 'Test User',
          appFontScaling: 1.2,
        },
        roundDTOs: jasmine.any(Array),
        courseDTOs: jasmine.any(Array),
      }),
    );

    // Check roundDTOs
    expect(userResult.roundDTOs?.length).toBe(2);
    userResult.roundDTOs.forEach((dto, idx) => {
      expect(dto.objectType).toBe('round');
      expect(dto.id).toBe(rounds[idx].id);
      expect(dto.generalNotes).toBe(rounds[idx].generalNotes);
      expect(dto.dateStringISO).toBe(rounds[idx].dateStringISO);
      expect(dto.courseId).toBe(rounds[idx].courseId);
    });

    // Check courseDTOs
    expect(userResult.courseDTOs.length).toBe(2);
    userResult.courseDTOs.forEach((dto, idx) => {
      expect(dto.objectType).toBe('course');
      expect(dto.id).toBe(courses[idx].id);
      expect(dto.name).toBe(courses[idx].name);
      expect(dto.numberOfHoles).toBe(courses[idx].numberOfHoles);
    });
  });

  it('should convert UserWithRoundsAndCourses to UserProfileDTO correctly', () => {
    const domain: UserWithRoundsAndCourses = {
      user: {
        id: 'u1',
        name: 'Test',
        roundIds: ['r1'],
        courseIds: ['c1'],
        appFontScaling: 1,
      },
      rounds: [
        {
          id: 'r1',
          dateStringISO: '2023-01-01T00:00:00Z',
          courseId: 'c1',
          strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
          putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
          roundVariety: RoundVariety.FULL_NINE,
          generalNotes: 'Test round',
        },
      ],
      courses: [
        {
          id: 'c1',
          name: 'Course',
          par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
          appFontScaling: 1,
        },
      ],
    };
    const dto = service.convertDomainToDTO({
      objectType: 'user',
      data: domain,
    }) as UserProfileDTO;
    expect(dto).toBeTruthy();
    expect(dto?.userDTO).toBeTruthy();
    expect(dto?.roundDTOs).toBeTruthy();
    expect(dto?.courseDTOs).toBeTruthy();
    expect(dto.userDTO.name).toBe('Test');
    expect(dto.roundDTOs.length).toBe(1);
    expect(dto.courseDTOs.length).toBe(1);
  });

  it('should convert UserProfileDTO to UserWithRoundsAndCourses domain object', () => {
    const dto: UserProfileDTO = {
      objectType: 'user',
      userDTO: { id: 'u1', name: 'Test', appFontScaling: 1 },
      roundDTOs: [
        {
          id: 'r1',
          dateStringISO: '2023-01-01T00:00:00Z',
          courseId: 'c1',
          strokes: [4, 4, 4, 4, 4, 4, 4, 4, 4],
          putts: [1, 1, 1, 1, 1, 1, 1, 1, 1],
          roundVariety: RoundVariety.FULL_NINE,
          generalNotes: 'Test round',
          objectType: 'round',
        },
      ],
      courseDTOs: [
        {
          objectType: 'course',
          id: 'c1',
          name: 'Course',
          par: [4, 4, 4, 4, 4, 4, 4, 4, 4],
          appFontScaling: 1,
        },
      ],
    };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeTruthy();
    expect(result!.objectType).toBe('user');
    const imported = result!.data as UserWithRoundsAndCourses;
    expect(imported.user.name).toBe('Test');
    expect(imported.rounds.length).toBe(1);
    expect(imported.courses.length).toBe(1);
  });

  it('should reject UserProfileDTO with missing userDTO', () => {
    const dto: any = { objectType: 'user', roundDTOs: [], courseDTOs: [] };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeNull();
  });

  it('should ignore extraneous properties in domain object', () => {
    const domain: UserWithRoundsAndCourses = {
      user: {
        id: 'u1',
        name: 'Test',
        roundIds: [],
        courseIds: [],
        appFontScaling: 1,
        extra: 'ignore',
      },
      rounds: [],
      courses: [],
    } as any;
    const dto = service.convertDomainToDTO({
      objectType: 'user',
      data: domain,
    });
    expect(dto).toBeTruthy();
    expect((dto as any).extra).toBeUndefined();
  });

  it('should handle domain object with empty rounds/courses arrays', () => {
    const domain: UserWithRoundsAndCourses = {
      user: {
        id: 'u1',
        name: 'Test',
        roundIds: [],
        courseIds: [],
        appFontScaling: 1,
      },
      rounds: [],
      courses: [],
    };
    const dto = service.convertDomainToDTO({
      objectType: 'user',
      data: domain,
    });
    expect(dto).toBeTruthy();
    const userDto = dto as UserProfileDTO;
    expect(userDto.roundDTOs.length).toBe(0);
    expect(userDto.courseDTOs.length).toBe(0);
  });

  it('should return null if DTO is missing objectType', () => {
    const dto: any = { userDTO: {}, roundDTOs: [], courseDTOs: [] };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeNull();
  });

  it('should return null if DTO is missing required fields', () => {
    const dto: any = { objectType: 'user', roundDTOs: [], courseDTOs: [] };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeNull();
  });

  it('should ignore extraneous properties in DTO', () => {
    const dto: any = {
      objectType: 'user',
      userDTO: { id: 'u1', name: 'Test', appFontScaling: 1, extra: 'ignore' },
      roundDTOs: [],
      courseDTOs: [],
      extra: 'ignore',
    };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeTruthy();
    expect((result!.data as any).extra).toBeUndefined();
  });

  it('should return null if DTO has invalid nested objects', () => {
    const dto: any = {
      objectType: 'user',
      userDTO: { id: 'u1', name: 'Test', appFontScaling: 1 },
      roundDTOs: [{ id: null }],
      courseDTOs: [],
    };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeNull();
  });

  it('should handle DTO with empty rounds/courses arrays', () => {
    const dto: any = {
      objectType: 'user',
      userDTO: { id: 'u1', name: 'Test', appFontScaling: 1 },
      roundDTOs: [],
      courseDTOs: [],
    };
    const result = service.convertDTOToDomain(dto);
    expect(result).toBeTruthy();
    expect((result!.data as UserWithRoundsAndCourses).rounds.length).toBe(0);
    expect((result!.data as UserWithRoundsAndCourses).courses.length).toBe(0);
  });
});
