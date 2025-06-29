import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-about-this-app',
  templateUrl: './about-this-app.component.html',
  styleUrls: ['./about-this-app.component.scss'],
  imports: [MatCardModule],
})
export class AboutThisAppComponent {
  constructor(private readonly appStateService: AppStateService) {
    this.appStateService.setPageTitle(`About This App`);
  }
}
