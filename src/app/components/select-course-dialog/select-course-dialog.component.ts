
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Course } from '../../models/course';
import { ParPipe } from '../../pipes/par.pipe';

interface SelectCourseOptions {
  importedCourse: Course;
  matchingCourses: Course[];
}

@Component({
  selector: 'app-select-course-dialog',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatRippleModule,
    ParPipe
],
  templateUrl: './select-course-dialog.component.html',
  styleUrl: './select-course-dialog.component.scss',
})
export class SelectCourseDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<SelectCourseDialogComponent>,
  );
  readonly options: SelectCourseOptions =
    inject<SelectCourseOptions>(MAT_DIALOG_DATA) || [];
  public readonly columns = ['courseName', 'coursePar'];

  public rowClicked(courseId: string): void {
    this.dialogRef.close(courseId);
  }

  public cancel(): void {
    this.dialogRef.close('');
  }
}
