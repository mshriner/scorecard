import { Routes } from '@angular/router';
import { ClearDataComponent } from './components/clear-data/clear-data.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { EditCourseComponent } from './components/edit-course/edit-course.component';
import { HomeComponent } from './components/home/home.component';
import { ProfilesComponent } from './components/profiles/profiles.component';
import { APP_ROUTES } from './models/constants';
import { EditRoundComponent } from './components/edit-round/edit-round.component';

export const routes: Routes = [
  { path: APP_ROUTES.PROFILES, component: ProfilesComponent },
  { path: APP_ROUTES.CLEAR_DATA, component: ClearDataComponent },
  { path: APP_ROUTES.ADD_EDIT_COURSE, component: EditCourseComponent },
  { path: APP_ROUTES.ADD_EDIT_ROUND, component: EditRoundComponent },
  { path: APP_ROUTES.COURSES, component: CourseListComponent },
  { path: APP_ROUTES.HOME, component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
