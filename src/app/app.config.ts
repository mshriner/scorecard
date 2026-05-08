import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { LocalStorageService } from './services/local-storage.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideAppInitializer(async () => {
      await inject(LocalStorageService).initialize();
    }),
  ],
};
