import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppStateService } from './services/app-state.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'scorecard';
  public currentUser = '';

  constructor(private appStateService: AppStateService) {}

  ngOnInit(): void {
    this.currentUser = this.appStateService.currentUser;
  }
  sendTheNewValue(event: any) {
    this.appStateService.currentUser = event.target.value;
  }
}
