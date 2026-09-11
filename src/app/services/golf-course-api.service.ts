import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Course } from '../models/generated/model/course';
import { CourseSearch } from '../models/generated/model/courseSearch';

@Service()
export class GolfCourseApiService {
  private readonly http = inject(HttpClient);

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Key ${environment.golfCourseApiKey}`,
    });
  }

  searchCourses(query: string): Observable<CourseSearch> {
    return this.http.get<CourseSearch>(
      `https://api.golfcourseapi.com/v1/search?search_query=${query}`,
      { headers: this.headers },
    );
  }

  getCourseById(id: number | string): Observable<Course> {
    return this.http.get<Course>(
      `https://api.golfcourseapi.com/v1/courses/${encodeURIComponent(id)}`,
      { headers: this.headers },
    );
  }
}
