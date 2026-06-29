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

import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { EnvironmentProviders, importProvidersFrom, inject, provideEnvironmentInitializer } from "@angular/core";
import { provideRouter } from "@angular/router";
import { JWT_OPTIONS, JwtModule } from "@auth0/angular-jwt";
import { TranslocoTestingModule } from "@jsverse/transloco";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { ConfigModel, ConfigSchema } from "@tenzu/repository/config-app/config.model";
import { EnvironmentConfig } from "../../../environments/environment-type";
import { environment } from "../../../environments/environment";
import { tokenGetter } from "../../../app/app.config";

export const TEST_CONFIG: EnvironmentConfig & ConfigModel = {
  ...environment,
  ...ConfigSchema.parse({
    env: "dev",
    wsUrl: "ws://localhost/ws",
    api: {
      prefix: "api",
      baseDomain: "localhost",
      scheme: "http",
      suffixDomain: "v1",
    },
  }),
};

export function provideConfigAppTesting(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    inject(ConfigAppService).config.set(TEST_CONFIG);
  });
}

export function provideTranslocoTesting(): EnvironmentProviders {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en: {} },
      translocoConfig: { availableLangs: ["en"], defaultLang: "en" },
      preloadLangs: true,
    }),
  );
}

export const testingProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideConfigAppTesting(),
  provideTranslocoTesting(),
  provideRouter([]),
  importProvidersFrom(
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: () => {
          const apiConfig = inject(ConfigAppService).configApi();
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
];
