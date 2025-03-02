import { ImportType } from '../models/data-transfer';

export class DataUtils {
  public static generateUUID(variety: ImportType): string {
    return `${variety}-${crypto.randomUUID()}`;
  }
}
