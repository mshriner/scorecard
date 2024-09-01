import { StorageObject } from "./storage-object";

export interface Course extends StorageObject {
  name: string;
  par: number[];
}