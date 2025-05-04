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
}
