import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-about-this-app',
  templateUrl: './about-this-app.component.html',
  styleUrls: ['./about-this-app.component.scss'],
  imports: [MatCardModule, MatDividerModule],
})
export class AboutThisAppComponent implements OnInit {
  constructor(private readonly appStateService: AppStateService) {
    this.appStateService.setPageTitle(`About This App`);
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('goToChangeLog')) {
      setTimeout(() => {
        document.getElementById('changelog')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        sessionStorage.removeItem('goToChangeLog');
      }, 1);
    }
  }
}
