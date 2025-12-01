import { DatePipe } from '@angular/common';
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
import { Round } from '../../models/round';
import { ScoreToParPipe } from '../../pipes/score-to-par.pipe';
import { TotalRoundScorePipe } from '../../pipes/total-round-score.pipe';

interface DeleteCourseOptions {
  course: Course;
  roundsToDelete: Round[];
}

@Component({
  selector: 'app-delete-course-dialog',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatRippleModule,
    DatePipe,
    TotalRoundScorePipe,
    ScoreToParPipe,
    DatePipe,
  ],
  templateUrl: './delete-course-dialog.component.html',
  styleUrl: './delete-course-dialog.component.scss',
})
export class DeleteCourseDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteCourseDialogComponent>);
  readonly options: DeleteCourseOptions =
    inject<DeleteCourseOptions>(MAT_DIALOG_DATA);
  readonly columns = ['roundDate', 'roundScore'];

  public confirm(): void {
    this.dialogRef.close(true);
  }

  public cancel(): void {
    this.dialogRef.close(false);
  }
}
