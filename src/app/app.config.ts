import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { JwtModule } from '@auth0/angular-jwt';
import { authKey } from './shared/services/account.service';
import { environment } from '../environments/environment.development';
import { PageTitleStrategy } from './shared/strategies/page-title.strategy';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => {
            return localStorage.getItem(authKey.accessToken);
          },
          allowedDomains: environment.allowedDomains,
          disallowedRoutes: [],
        },
      })
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideHttpClient(
      withInterceptors([errorInterceptor]),
      withInterceptorsFromDi()
    ),
    provideAnimationsAsync(),

    provideZoneChangeDetection({ eventCoalescing: true }), //รวมหลาย event ที่เกิดใกล้เคียงกันแล้วจึงทำงานรอบเดียว
    provideRouter(routes),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
  ],
};
