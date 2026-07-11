import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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
}
