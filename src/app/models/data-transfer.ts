import { Course } from './course';
import { Round } from './round';
import { User } from './user';

export interface ExportedItem {
  objectType: ImportType;
}

export interface RoundWithCourse {
  round: Round;
  course: Course;
}

export interface UserWithRoundsAndCourses {
  user: User;
  rounds: Round[];
  courses: Course[];
}

export interface DataToShare {
  objectType: ImportType;
  data: Course | UserWithRoundsAndCourses | RoundWithCourse;
}

export type ImportType = 'course' | 'round' | 'user';

export interface YesNoReason {
  result: boolean;
  reason: string;
}
