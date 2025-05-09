import { ImportType } from '../models/data-transfer';

export class DataUtils {
  public static generateUUID(variety: ImportType): string {
    return `${variety}-${crypto.randomUUID()}`;
  }

  public static justBeforeNextDay(date?: Date | null): Date | null {
    if (!date) {
      return null;
    }
    const newDate = new Date(date.valueOf());
    newDate.setDate(date.getDate() + 1);
    newDate.setMilliseconds(date.getMilliseconds() - 1);
    return newDate;
  }

  /*
  Forked from https://github.com/epoberezkin/fast-deep-equal (also has MIT license)
  Needed ESM support or else Angular complains about treeshaking
  (https://github.com/fullcalendar/fullcalendar-angular/issues/421)
  */
  public static deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return Number.isNaN(a) && Number.isNaN(b);
    }
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => DataUtils.deepEqual(item, b[index]));
    }
    if (a instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }
    if (a.valueOf !== Object.prototype.valueOf || a.toString !== Object.prototype.toString) {
      return a.valueOf() === b.valueOf() && a.toString() === b.toString();
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!b.hasOwnProperty(key) || !DataUtils.deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
}
