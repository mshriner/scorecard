import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(LocalStorageService);
    await service.initialize();
    await service.clear();
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });

  // it('should store a number correctly', () => {
  //   const testValue = 56;
  //   service.setItem('testNumber', testValue);
  //   expect(service.getItem('testNumber')).toEqual(testValue);
  // });

  // it('should store a string correctly', () => {
  //   const testValue = `mshriner's test`;
  //   service.setItem('testString', testValue);
  //   expect(service.getItem('testString')).toEqual(testValue);
  // });

  // it('should store a simple object correctly', () => {
  //   const testValue = { num: 56, str: `mshriner's test` };
  //   service.setItem('testObject', testValue);
  //   expect(service.getItem('testObject')).toEqual(testValue);
  // });
});
