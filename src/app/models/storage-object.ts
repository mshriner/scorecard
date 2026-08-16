export type StorageValue =
  | undefined
  | string
  | string[]
  | boolean
  | boolean[]
  | number
  | number[]
  | (number | null)[]
  | StorageValue[]
  | { [key: string]: StorageValue | undefined };

export interface StorageObject {
  id: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function assertStorageSafe(
  value: unknown,
  path = 'value',
): asserts value is StorageValue {
  if (value === null || value === undefined) {
    return;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertStorageSafe(entry, `${path}[${index}]`),
    );
    return;
  }

  if (typeof value === 'object') {
    if (!isPlainObject(value)) {
      throw new TypeError(
        `Non-serializable runtime object at ${path}: ${Object.getPrototypeOf(value)?.constructor?.name ?? 'Object'}`,
      );
    }

    for (const [key, nested] of Object.entries(value)) {
      assertStorageSafe(nested, `${path}.${key}`);
    }
    return;
  }

  throw new TypeError(`Non-serializable value at ${path}: ${typeof value}`);
}

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
export type EighteenNumbers = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
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
export type EighteenNumbersOrNulls = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
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
