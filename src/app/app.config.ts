/*
 * Copyright (C) 2024-2026 BIRU
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
  ErrorHandler,
  importProvidersFrom,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from "@angular/core";
import { NgEventBus } from "ng-event-bus";
import { provideRouter, RouteReuseStrategy, withComponentInputBinding, withRouterConfig } from "@angular/router";
import * as Sentry from "@sentry/angular";
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
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { WsService } from "@tenzu/utils/services/ws";
import { provideTranslocoLocale } from "@jsverse/transloco-locale";
import { providePlugins } from "./providers-plugins";

import { InjectionToken } from "@angular/core";
import { environment } from "../environments/environment";
import { lastValueFrom } from "rxjs";

export type Plugin = object;

export const PLUGINS_TOKEN = new InjectionToken<(Plugin | null)[]>("PLUGINS_TOKEN");
export function tokenGetter() {
  return localStorage.getItem("token");
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: PLUGINS_TOKEN,
      useValue: null,
      multi: true,
    },
    ...providePlugins(),
    provideAppInitializer(async () => {
      const configAppService = inject(ConfigAppService);
      const languageStore = inject(LanguageStore);
      const wsService = inject(WsService);
      await configAppService.loadAppConfig();
      if (configAppService.config().sentry.dsn) {
        Sentry.init({
          dsn: configAppService.config().sentry.dsn,
          environment: configAppService.config().sentry.environment,
          release: environment.appVersion,
        });
      }
      wsService.init().then();
      lastValueFrom(languageStore.initLanguages()).then();
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
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ paramsInheritanceStrategy: "always" })),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        availableLangs: ["en-us"],
        defaultLang: "en-us",
        fallbackLang: "en-us",
        flatten: {
          aot: !isDevMode(),
        },
      },
      loader: TranslocoHttpLoaderService,
    }),
    provideTranslocoMessageformat(),
    provideTranslocoLocale(),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    provideHttpClient(withFetch(), withInterceptors([httpInterceptor]), withInterceptorsFromDi()),
    NgEventBus,
  ],
};
