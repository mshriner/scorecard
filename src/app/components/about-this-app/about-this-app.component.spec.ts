import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutThisAppComponent } from './about-this-app.component';

describe('AboutThisAppComponent', () => {
  let component: AboutThisAppComponent;
  let fixture: ComponentFixture<AboutThisAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutThisAppComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutThisAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
