/*
 * Copyright (C) 2024 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideExperimentalZonelessChangeDetection,
  inject,
  provideAppInitializer,
} from "@angular/core";
import { provideRouter, withComponentInputBinding, withRouterConfig } from "@angular/router";

import { routes } from "./app.routes";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { provideTransloco } from "@jsverse/transloco";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { JwtModule } from "@auth0/angular-jwt";
import { PRECONNECT_CHECK_BLOCKLIST } from "@angular/common";
import { environment } from "../environments/environment";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { LanguageStore } from "@tenzu/data/transloco";
import { refreshTokenInterceptor } from "@tenzu/data/interceptors";
import { provideMicroSentry } from "@micro-sentry/angular";

export function tokenGetter() {
  return localStorage.getItem("token");
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: PRECONNECT_CHECK_BLOCKLIST,
      useValue: `${environment.api.scheme}://${environment.api.baseDomain}`,
    },
    provideAppInitializer(() => {
      const languageStore = inject(LanguageStore);
      languageStore.initLanguages().subscribe();
      return;
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [environment.api.baseDomain],
          headerName: "Authorization",
          authScheme: "Bearer ",
        },
      }),
    ),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ paramsInheritanceStrategy: "always" })),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        availableLangs: ["en-US"],
        defaultLang: "en-US",
        fallbackLang: "en-US",
        flatten: {
          aot: !isDevMode(),
        },
      },
      loader: TranslocoHttpLoaderService,
    }),
    provideTranslocoMessageformat(),
    provideMicroSentry({
      dsn: environment.sentry.dsn,
      environment: environment.sentry.environment,
      release: environment.sentry.release,
    }),
    provideHttpClient(withFetch(), withInterceptors([refreshTokenInterceptor]), withInterceptorsFromDi()),
  ],
};
