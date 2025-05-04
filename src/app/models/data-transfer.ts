import { Course } from './course';
import { Round } from './round';
import { User } from './user';

export interface ExportedItem {
  fromProfileName: string;
  fromProfileId: string;
  objectType: ImportType;
}

export interface DataToShare {
  objectType: ImportType;
  data: Course | User | Round;
}

export type ImportType = 'course' | 'round' | 'user';
