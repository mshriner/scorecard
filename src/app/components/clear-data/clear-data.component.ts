import { Component } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-clear-data',
  standalone: true,
  imports: [],
  templateUrl: './clear-data.component.html',
  styleUrl: './clear-data.component.scss',
})
export class ClearDataComponent {
  constructor(
    private appStateService: AppStateService,
    private localStorageService: LocalStorageService
  ) {
    this.appStateService.currentUser = null;
    this.localStorageService.clear();
    this.appStateService.setPageTitle('App Data Cleared! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1750);
  }
}
