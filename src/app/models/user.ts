import { StorageObject } from "./storage-object";

export interface User extends StorageObject {
  name: string;
  roundIds: string[];
  courseIds: string[];
}