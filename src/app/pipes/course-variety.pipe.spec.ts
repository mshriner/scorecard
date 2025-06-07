import { CourseVariety } from '../models/course';
import { CourseVarietyPipe } from './course-variety.pipe';

describe('CourseVarietyPipe', () => {
  it('create an instance', () => {
    const pipe = new CourseVarietyPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return formatted values', () => {
    const pipe = new CourseVarietyPipe();
    expect(pipe.transform(CourseVariety.NINE)).toEqual('9 holes');
    expect(pipe.transform(CourseVariety.EIGHTEEN)).toEqual('18 holes');
  });
});
