import { AfterViewInit, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-about-this-app',
  templateUrl: './about-this-app.component.html',
  styleUrls: ['./about-this-app.component.scss'],
  imports: [MatCardModule, MatDividerModule, MatIconModule],
})
export class AboutThisAppComponent implements AfterViewInit {
  constructor(private readonly appStateService: AppStateService) {
    this.appStateService.setPageTitle(`About This App`);
  }

  ngAfterViewInit(): void {
    if (sessionStorage.getItem('goToChangeLog')) {
      setTimeout(() => {
        document.getElementById('changelog')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        sessionStorage.removeItem('goToChangeLog');
      }, 100);
    }
  }
}
