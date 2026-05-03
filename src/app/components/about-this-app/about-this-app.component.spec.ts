import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mocked } from 'vitest';
import { LocalStorageService } from '../../services/local-storage.service';
import { createLocalStorageServiceTestMock } from '../../services/local-storage.service.spec';
import { AboutThisAppComponent } from './about-this-app.component';

describe('AboutThisAppComponent', () => {
  let component: AboutThisAppComponent;
  let fixture: ComponentFixture<AboutThisAppComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = createLocalStorageServiceTestMock();
    await TestBed.configureTestingModule({
      imports: [AboutThisAppComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutThisAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
