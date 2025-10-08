import { Routes } from '@angular/router';
import { AboutThisAppComponent } from './components/about-this-app/about-this-app.component';
import { ClearDataComponent } from './components/clear-data/clear-data.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { EditCourseComponent } from './components/edit-course/edit-course.component';
import { EditRoundComponent } from './components/edit-round/edit-round.component';
import { HomeComponent } from './components/home/home.component';
import { ProfilesComponent } from './components/profiles/profiles.component';
import { APP_ROUTES } from './models/constants';

export const routes: Routes = [
  { path: APP_ROUTES.PROFILES, component: ProfilesComponent },
  { path: APP_ROUTES.CLEAR_DATA, component: ClearDataComponent },
  { path: APP_ROUTES.ADD_EDIT_COURSE, component: EditCourseComponent },
  { path: APP_ROUTES.ADD_EDIT_ROUND, component: EditRoundComponent },
  { path: APP_ROUTES.COURSES, component: CourseListComponent },
  { path: APP_ROUTES.HOME, component: HomeComponent },
  { path: APP_ROUTES.ABOUT, component: AboutThisAppComponent },
  { path: '', redirectTo: `/${APP_ROUTES.HOME}`, pathMatch: 'full' },
  { path: '**', redirectTo: `/${APP_ROUTES.HOME}` },
];
