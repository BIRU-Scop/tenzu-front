/*
 * Copyright (C) 2024-2025 BIRU
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
  inject,
  isDevMode,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from "@angular/core";
import { provideRouter, RouteReuseStrategy, withComponentInputBinding, withRouterConfig } from "@angular/router";

import { CustomReuseStrategy, routes } from "./app.routes";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideTransloco } from "@jsverse/transloco";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { JWT_OPTIONS, JwtModule } from "@auth0/angular-jwt";
import { PRECONNECT_CHECK_BLOCKLIST } from "@angular/common";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { LanguageStore } from "@tenzu/repository/transloco";
import { httpInterceptor } from "@tenzu/utils/interceptors";
import { MICRO_SENTRY_CONFIG, provideMicroSentry } from "@micro-sentry/angular";
import { ConfigAppService } from "./config-app/config-app.service";
import { BrowserSentryClientOptions } from "@micro-sentry/browser";
import { WsService } from "@tenzu/utils/services/ws";
import { provideTranslocoLocale } from "@jsverse/transloco-locale";

export function tokenGetter() {
  return localStorage.getItem("token");
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(async () => {
      const configAppService = inject(ConfigAppService);
      const languageStore = inject(LanguageStore);
      const wsService = inject(WsService);
      await configAppService.loadAppConfig();
      await wsService.init();
      languageStore.initLanguages().subscribe();
      return;
    }),
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    {
      provide: PRECONNECT_CHECK_BLOCKLIST,
      useFactory: () => {
        const configAppService = inject(ConfigAppService);
        const apiConfig = configAppService.configApi();
        if (!apiConfig) {
          throw new Error("Config API returned no configuration");
        }
        return `${apiConfig.scheme}://${apiConfig.baseDomain}`;
      },
      deps: [ConfigAppService],
    },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
    importProvidersFrom(
      JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: () => {
            const configAppService = inject(ConfigAppService);
            const apiConfig = configAppService.configApi();
            return {
              tokenGetter: tokenGetter,
              allowedDomains: [apiConfig.baseDomain],
              headerName: "Authorization",
              authScheme: "Bearer ",
            };
          },
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
    provideTranslocoLocale(),
    provideMicroSentry({}),
    {
      provide: MICRO_SENTRY_CONFIG,
      useFactory: () => {
        // const configAppService = inject(ConfigAppService);
        // const sentryConfig = configAppService.configSentry();
        const sentryConfig: BrowserSentryClientOptions = JSON.parse(localStorage.getItem("sentry") || "{}");
        if (sentryConfig) {
          return {
            dsn: sentryConfig.dsn,
            environment: sentryConfig.environment,
            release: sentryConfig.release,
          };
        }
        return {};
      },
    },
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor]), withInterceptorsFromDi()),
  ],
};
