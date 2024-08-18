import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  // Set a value in local storage
  public setItem(key: string, value: unknown): void {
    if (value === null) {
      this.removeItem(key);
      return;
    }
    // Note: this will not properly store / retrieve any complex types like Date()
    localStorage.setItem(key, JSON.stringify(value));
    this.auditLocalStorageSize();
  }

  // Get a value from local storage
  public getItem(key: string): any {
    const retrieved = localStorage.getItem(key);
    if (retrieved === null) {
      return null;
    }
    return JSON.parse(retrieved);
  }

  // Remove a value from local storage
  public removeItem(key: string): void {
    localStorage.removeItem(key);
    this.auditLocalStorageSize();
  }

  // Clear all items from local storage
  public clear(): void {
    localStorage.clear();
  }

  private auditLocalStorageSize(): void {
    console.log('storage size: ', localStorage.length);
  }
}
