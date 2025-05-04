export type StorageObject = {
  id: string;
} & {
  [key: string]:
    | undefined
    | string
    | string[]
    | boolean
    | boolean[]
    | number
    | number[]
    | (number | null)[]
    | StorageObject
    | StorageObject[];
};
