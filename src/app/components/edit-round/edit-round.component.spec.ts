import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRoundComponent } from './edit-round.component';

describe('EditRoundComponent', () => {
  let component: EditRoundComponent;
  let fixture: ComponentFixture<EditRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
