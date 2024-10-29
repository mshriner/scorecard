import { Course } from './course';
import { Round } from './round';
import { User } from './user';

export interface ExportedItem {
  fromProfileName: string;
  fromProfileId: string;
}

export interface CourseDTO extends Course, ExportedItem {}

export interface RoundDTO extends Round, ExportedItem {
  courseDTO: CourseDTO;
}

export interface UserDTO extends User, ExportedItem {
  courseDTOs: CourseDTO[];
  roundDTOs: RoundDTO[];
}
