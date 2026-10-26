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

import { inject, Signal, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Params } from "@angular/router";
import {
  AuthConfig,
  authConfigSchema,
  Credential,
  ProviderCallback,
  providerCallbackSchema,
  ProviderContinueSignupPayload,
  ProviderRedirect,
  SocialProvider,
  RotatedTokens,
  rotatedTokensSchema,
  Tokens,
  tokensSchema,
} from "./auth.model";
import { parseWithDebug } from "@tenzu/repository/base/parse-with-debug";
import { lastValueFrom, map, Observable, tap } from "rxjs";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { AuthConfigStore } from "./auth-config.store";
import { debug } from "@tenzu/utils/functions/logging";

@Service()
export class AuthService {
  configAppService = inject(ConfigAppService);
  http = inject(HttpClient);
  url = `${this.configAppService.apiUrl()}/auth`;
  protected configStore = inject(AuthConfigStore);

  get providers(): Signal<SocialProvider[]> {
    return this.configStore.entities;
  }

  refreshTokens(refresh: string): Observable<RotatedTokens> {
    return this.http
      .post<unknown>(`${this.url}/token/refresh`, { refresh })
      .pipe(map((data) => parseWithDebug(rotatedTokensSchema, data)));
  }

  blacklistRefreshToken(refresh: string): Observable<void> {
    return this.http.post<Record<string, never>>(`${this.url}/blacklist`, { refresh }).pipe(map(() => undefined));
  }

  login(credentials: Credential): Observable<Tokens> {
    return this.http
      .post<unknown>(`${this.url}/token`, {
        ...credentials,
      })
      .pipe(map((data) => parseWithDebug(tokensSchema, data)));
  }

  private getConfig(): Observable<AuthConfig> {
    return this.http
      .get<BaseDataModel<unknown>>(`${this.url}/config`)
      .pipe(map((dataObject) => parseWithDebug(authConfigSchema, dataObject.data)));
  }

  async initConfig() {
    return await lastValueFrom(
      this.getConfig().pipe(
        tap((config) => debug("getConfig", "received", config)),
        tap((config) => this.configStore.setProviders(config.socialaccount.providers)),
      ),
    );
  }

  redirectToProviderBaseParams(providerId: string, queryParams: Params, isSignup: boolean): ProviderRedirect {
    const query = new URLSearchParams(queryParams);
    query.append("fromSignup", isSignup.toString());
    const callbackUrl = `/social-auth-callback?${query.toString()}`;
    debug("redirectToProviderBaseParams", callbackUrl);
    return {
      url: `${this.url}/provider/${providerId}/redirect`,
      body: {
        callbackUrl: callbackUrl,
      },
    };
  }

  continueSignup(payload: ProviderContinueSignupPayload): Observable<ProviderCallback> {
    return this.http
      .post<unknown>(`${this.url}/provider/continue_signup`, payload)
      .pipe(map((data) => parseWithDebug(providerCallbackSchema, data)));
  }
}
