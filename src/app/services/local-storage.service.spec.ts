import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store a number correctly', () => {
    service.clear();
    const testValue = 56;
    service.setItem('testNumber', testValue);
    expect(service.getItem('testNumber')).toEqual(testValue);
  });

  it('should store a string correctly', () => {
    service.clear();
    const testValue = `mshriner's test`;
    service.setItem('testString', testValue);
    expect(service.getItem('testString')).toEqual(testValue);
  });

  it('should store a simple object correctly', () => {
    service.clear();
    const testValue = { num: 56, str: `mshriner's test` };
    service.setItem('testObject', testValue);
    expect(service.getItem('testObject')).toEqual(testValue);
  });
});
