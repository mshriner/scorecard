import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRoundDialogComponent } from './best-round-dialog.component';

describe('BestRoundDialogComponent', () => {
  let component: BestRoundDialogComponent;
  let fixture: ComponentFixture<BestRoundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BestRoundDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BestRoundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
