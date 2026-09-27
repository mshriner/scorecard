import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mocked } from 'vitest';
import { createEmptyHoleResults } from '../../models/graph';
import { LocalStorageService } from '../../services/local-storage.service';
import { createLocalStorageServiceTestMock } from '../../services/local-storage.service.spec';
import { StatsComponent } from './stats.component';

describe('HomeStatsComponent-homepage-mode', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = createLocalStorageServiceTestMock();
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('filteredRounds', []);
    fixture.componentRef.setInput('courseMap', new Map());
    fixture.componentRef.setInput('holeResultTotals', createEmptyHoleResults());
    fixture.componentRef.setInput('mode', 'homepage');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });
});
describe('HomeStatsComponent-in-round-mode', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let localStorageService: Mocked<LocalStorageService>;

  beforeEach(async () => {
    localStorageService = createLocalStorageServiceTestMock();
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [
        {
          provide: LocalStorageService,
          useValue: localStorageService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('filteredRounds', []);
    fixture.componentRef.setInput('courseMap', new Map());
    fixture.componentRef.setInput('holeResultTotals', createEmptyHoleResults());
    fixture.componentRef.setInput('mode', 'in-round');
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });
});
