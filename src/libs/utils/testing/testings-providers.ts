import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { importProvidersFrom } from "@angular/core";
import { JwtModule } from "@auth0/angular-jwt";
import { tokenGetter } from "../../../app/app.config";
import { environment } from "../../../environments/environment";

export const httpTestingProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
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
];
