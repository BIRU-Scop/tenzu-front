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

import { applicationConfig } from "@storybook/angular-vite";
import { ErrorHandler, inject, isDevMode, provideEnvironmentInitializer } from "@angular/core";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";
import { provideTranslocoLocale } from "@jsverse/transloco-locale";
import * as Sentry from "@sentry/angular";
import { withDevToolsStub } from "@angular-architects/ngrx-toolkit";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

export const withTransloco = applicationConfig({
  providers: [
    provideTransloco({
      config: {
        availableLangs: ["en-US"],
        defaultLang: "en-US",
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoaderService,
    }),
    provideTranslocoMessageformat(),
    provideTranslocoLocale(),
    { provide: ErrorHandler, useValue: Sentry.createErrorHandler() },
  ],
});

// For stories whose component injects api services: they read the api url from ConfigAppService on creation.
export const withConfigApp = applicationConfig({
  providers: [
    provideEnvironmentInitializer(() => {
      inject(ConfigAppService).config.set({
        env: "dev",
        storeWithDevTools: withDevToolsStub,
        debug: false,
        wsUrl: "ws://localhost",
        api: { scheme: "http", baseDomain: "localhost", suffixDomain: "api", prefix: "v1" },
        maxUploadFileSize: 100 * 1024 * 1024,
        avatars: { maxUploadFileSize: 500 * 1024, allowedFormats: [".jpg", ".png", ".gif", ".webp"] },
        legal: null,
        security: { password: { minLength: 8, numberDiversityDifference: 3, lengthSecureThreshold: 12 } },
        sentry: {},
        appVersion: "0.0.0-storybook",
      });
    }),
  ],
});
