import { Component, inject } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snack-bar',
  standalone: true,
  imports: [],
  templateUrl: './snack-bar.component.html',
  styleUrl: './snack-bar.component.scss'
})
export class SnackBarComponent {
  private _snackBar = inject(MatSnackBar);

  // openSnackBar(message: string, action: string) {
  //   this._snackBar.open(message, action);
  // }
}
