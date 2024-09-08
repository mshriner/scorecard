import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { AreYouSureDialogConfig } from '../../models/dialog';

@Component({
  selector: 'app-are-you-sure-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './are-you-sure-dialog.component.html',
  styleUrl: './are-you-sure-dialog.component.scss'
})
export class AreYouSureDialogComponent {

  readonly dialogRef = inject(MatDialogRef<AreYouSureDialogComponent>);
  public readonly data: AreYouSureDialogConfig = inject<AreYouSureDialogConfig>(MAT_DIALOG_DATA);

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public clear(): void {
    this.dialogRef.close(true);
  }
}