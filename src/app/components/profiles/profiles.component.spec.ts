import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { UserWithRoundsAndCourses } from '../../models/data-transfer';
import { ProfilesComponent } from './profiles.component';

describe('ProfilesComponent', () => {
  let component: ProfilesComponent;
  let fixture: ComponentFixture<ProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilesComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should import a valid user profile and update profiles list', async () => {
    // Mock file input and sharingService.convertDTOToDomain
    const validProfile = {
      objectType: 'user',
      userDTO: {
        id: 'u1',
        name: 'Test',
        appFontScaling: 1,
        roundIds: [],
        courseIds: [],
      },
      roundDTOs: [],
      courseDTOs: [],
    };
    spyOn(component['sharingService'], 'convertDTOToDomain').and.returnValue({
      objectType: 'user',
      data: { user: validProfile.userDTO, rounds: [], courses: [] },
    });
    const input = {
      files: [{ text: () => Promise.resolve(JSON.stringify(validProfile)) }],
    } as any;
    // Spy on dialog.open before calling the function
    spyOn(component['dialog'], 'open').and.callThrough();
    const result = await component.onFileSelected(input);
    expect(result).toBeTrue();
    // Check that dialog was opened
    expect(component['dialog'].open).toHaveBeenCalled();
  });

  it('should show error and return false for invalid user profile import', async () => {
    spyOn(component['sharingService'], 'convertDTOToDomain').and.returnValue(
      null,
    );
    const input = { files: [{ text: () => Promise.resolve('{}') }] } as any;
    const result = await component.onFileSelected(input);
    expect(result).toBeFalse();
  });

  it('should return false if file input is null or has no files', async () => {
    const input = { files: [] } as any;
    const result = await component.onFileSelected(input);
    expect(result).toBeFalse();
  });

  it('should return false if file object does not have text() method', async () => {
    const input = { files: [{}] } as any;
    const result = await component.onFileSelected(input);
    expect(result).toBeFalse();
  });

  it('should return false if file is empty or not valid JSON', async () => {
    const input = { files: [{ text: () => Promise.resolve('') }] } as any;
    spyOn(component['sharingService'], 'convertDTOToDomain').and.returnValue(
      null,
    );
    const result = await component.onFileSelected(input);
    expect(result).toBeFalse();
  });

  it('should return false if imported objectType is not user', async () => {
    const notUserProfile = {
      objectType: 'course',
      userDTO: {},
      roundDTOs: [],
      courseDTOs: [],
    };
    spyOn(component['sharingService'], 'convertDTOToDomain').and.returnValue({
      objectType: 'course',
      data: {} as UserWithRoundsAndCourses,
    });
    const input = {
      files: [{ text: () => Promise.resolve(JSON.stringify(notUserProfile)) }],
    } as any;
    const result = await component.onFileSelected(input);
    expect(result).toBeFalse();
  });
});
