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

import { applicationConfig } from "@storybook/angular";
import { ErrorHandler, isDevMode } from "@angular/core";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";
import { provideTranslocoLocale } from "@jsverse/transloco-locale";
import * as Sentry from "@sentry/angular";

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
