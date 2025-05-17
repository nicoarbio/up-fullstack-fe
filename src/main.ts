import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Settings } from 'luxon';

Settings.defaultLocale = 'es-AR';
Settings.defaultZone = 'America/Argentina/Buenos_Aires';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
