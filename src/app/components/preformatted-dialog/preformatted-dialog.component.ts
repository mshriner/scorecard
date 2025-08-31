import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preformatted-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  templateUrl: './preformatted-dialog.component.html',
  styleUrl: './preformatted-dialog.component.scss',
})
export class PreformattedDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PreformattedDialogComponent>);
  public readonly data: { title: string; content: string } =
    inject(MAT_DIALOG_DATA);

  public closeClicked(): void {
    this.dialogRef.close();
  }
}
