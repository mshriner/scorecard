import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
export class PreformattedDialogComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<PreformattedDialogComponent>);
  readonly data: {
    dialogTitle: string;
    fileTitle: string;
    content: string;
  } = inject(MAT_DIALOG_DATA);
  downloadHref: string | null = null;
  downloadName: string | null = null;

  ngOnInit() {
    this.createDownloadContent();
  }

  ngOnDestroy() {
    try {
      URL.revokeObjectURL(this.downloadHref || '');
    } finally {
      // noop
    }
  }

  private createDownloadContent() {
    const blob = new Blob([this.data.content], { type: 'application/json' });

    // Create a temporary URL for the Blob
    this.downloadHref = URL.createObjectURL(blob);
    this.downloadName = `${this.data.fileTitle}.json`;
  }

  public closeClicked(): void {
    this.dialogRef.close();
  }
}
