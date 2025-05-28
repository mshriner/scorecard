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

export type NineNumbers = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
export type EighteenNumbers = [...NineNumbers, ...NineNumbers];

export type NineNumbersOrNulls = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];
export type EighteenNumbersOrNulls = [...NineNumbersOrNulls, ...NineNumbersOrNulls];
