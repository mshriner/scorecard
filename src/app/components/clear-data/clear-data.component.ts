import { Component, inject, OnInit } from '@angular/core';
import { AppStateService } from '../../services/app-state.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-clear-data',
  imports: [],
  templateUrl: './clear-data.component.html',
  styleUrl: './clear-data.component.scss',
})
export class ClearDataComponent implements OnInit {
  private readonly appStateService = inject(AppStateService);
  private readonly localStorageService = inject(LocalStorageService);

  constructor() {
    this.appStateService.currentUser.set(null);
  }

  ngOnInit() {
    this.localStorageService.clear().then(() => {
      this.appStateService.setPageTitle('App Data Cleared! Reloading...');
      setTimeout(() => {
        globalThis.location.reload();
      }, 1750);
    });
  }
}
