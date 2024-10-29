import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  provideExperimentalZonelessChangeDetection,
} from "@angular/core";
import { provideRouter, withRouterConfig } from "@angular/router";

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
import { lastValueFrom } from "rxjs";
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
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [LanguageStore],
      useFactory: (languageStore: LanguageStore) => {
        return () => {
          return lastValueFrom(languageStore.initLanguages());
        };
      },
    },
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
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: "always" })),
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
