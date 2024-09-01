import { StorageObject } from "./storage-object";

export interface Round extends StorageObject {
  dateStringISO: string
  title?: string;
  courseId: string;
  strokes: number[];
  putts: number[]; 
}