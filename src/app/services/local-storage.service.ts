import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  // Set a value in local storage
  public setItem(key: string, value: unknown): boolean {
    try {
      if (value === null) {
        this.removeItem(key);
        return true;
      }
      // Note: this will not properly store / retrieve any complex types like Date()
      localStorage.setItem(key, JSON.stringify(value));

      console.log('set', value, 'at key', key, this.auditLocalStorageSize());
      return true;
    } catch (err: any) {
      console.error(`couldn't store key ${key}`, err);
      return false;
    }
  }

  // Get a value from local storage
  public getItem(key: string): any {
    const retrieved = localStorage.getItem(key);
    console.log('retrieved', retrieved, 'at key', key);
    if (retrieved === null || !retrieved?.length) {
      return null;
    }
    return JSON.parse(retrieved || '');
  }

  // Remove a value from local storage
  public removeItem(key: string): void {
    localStorage.removeItem(key);
    console.log('removed', key, this.auditLocalStorageSize());
  }

  // Clear all items from local storage
  public clear(): void {
    localStorage.clear();
    console.log('cleared all storage');
  }

  private auditLocalStorageSize(): string {
    return `storage size: ${localStorage.length}`;
  }
}
