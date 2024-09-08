import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { Course } from '../../models/course';
import { AppStateService } from '../../services/app-state.service';
import { CourseService } from '../../services/course.service';
import { ParPipe } from '../../pipes/par.pipe';
import { PipesModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    PipesModule,
  ],
  templateUrl: './edit-course.component.html',
  styleUrl: './edit-course.component.scss',
})
export class EditCourseComponent {
  public editingCourse: Course;
  private courseIdToEdit: string;
  public readonly HOLE_COL = 'hole';
  public readonly PAR_COL = 'par';
  public readonly COURSE_TABLE_COLUMNS = [
    {
      columnDef: this.HOLE_COL,
      header: 'Hole',
      holeNumberColumn: true,
    },
    {
      columnDef: this.PAR_COL,
      header: 'Par',
      holeNumberColumn: false,
    },
  ];
  public readonly COURSE_TABLE_COLUMN_IDS = this.COURSE_TABLE_COLUMNS.map(
    (def) => def.columnDef
  );

  constructor(
    private appStateService: AppStateService,
    private courseService: CourseService,
    private router: Router
  ) {
    this.courseIdToEdit =
      router.getCurrentNavigation()?.extras?.state?.[
        NAVIGATION_STATE_KEYS.COURSE_ID_TO_EDIT
      ];
    console.log(this.courseIdToEdit);
    if (this.courseIdToEdit) {
      const retrieved = this.courseService.getCourse(this.courseIdToEdit);
      this.editingCourse = JSON.parse(JSON.stringify(retrieved));
      this.appStateService.setPageTitle(`Editing ${retrieved?.name}`);
    } else {
      this.editingCourse = {
        id: `course-${crypto.randomUUID()}`,
        par: new Array(18).fill(4),
        name: '',
      };
      this.appStateService.setPageTitle(`Create Course`);
    }
  }

  public parPlusOne(index: number) {
    this.editingCourse.par[index]++;
  }
  
  public parMinusOne(index: number) {
    if (this.editingCourse.par[index]) {
      this.editingCourse.par[index]--;
    }
  }

  public get disableSaveButton(): boolean {
    return (
      !this.editingCourse.name.length ||
      this.editingCourse.par.some((hole) => (hole || 0) <= 0)
    );
  }

  public saveCourse(): void {
    if (!this.courseIdToEdit) {
      this.appStateService.currentUser?.courseIds.push(this.editingCourse.id);
    }
    this.appStateService.saveCurrentUser();
    this.courseService.setCourse(this.editingCourse);
    this.router.navigateByUrl(APP_ROUTES.COURSES);
  }
}
