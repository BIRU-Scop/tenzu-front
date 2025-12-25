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

import { inject, Injectable, Signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  AuthConfig,
  Credential,
  ProviderCallback,
  ProviderContinueSignupPayload,
  ProviderRedirect,
  SocialProvider,
  Tokens,
} from "./auth.model";
import { catchError, lastValueFrom, map, Observable, of, Subscription, take, tap, timer } from "rxjs";
import { NavigationExtras, Params, Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { WsService } from "@tenzu/utils/services/ws";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ResetService } from "@tenzu/repository/base/reset.service";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import { debug } from "@tenzu/utils/functions/logging";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  jwtHelperService = inject(JwtHelperService);
  configAppService = inject(ConfigAppService);
  wsService = inject(WsService);
  notificationService = inject(NotificationService);
  http = inject(HttpClient);
  router = inject(Router);
  readonly resetService = inject(ResetService);
  url = `${this.configAppService.apiUrl()}/auth`;
  autoLogoutSubscription: Subscription | null = null;
  protected configStore = inject(AuthConfigStore);

  get providers(): Signal<SocialProvider[]> {
    return this.configStore.entities;
  }

  login(credentials: Credential): Observable<Tokens> {
    return this.http
      .post<Tokens>(`${this.url}/token`, {
        ...credentials,
      })
      .pipe(tap((value) => this.setToken(value)));
  }

  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    if (this.autoLogoutSubscription) {
      this.autoLogoutSubscription.unsubscribe();
      this.autoLogoutSubscription = null;
    }
    this.resetService.reset();
  }

  autoLogout() {
    this.logout();
    this.notificationService.error({ title: "notification.login.logout" });
  }
  userLogout() {
    const tokens = this.getToken();
    if (tokens.refresh) {
      // tokens could be empty in case of concurrent autologout or manual clear of localstorage
      this.http
        .post<Record<string, never>>(`${this.url}/blacklist`, {
          refresh: tokens.refresh,
        })
        .pipe(catchError(() => of(false))) // if blacklist fail, ignore silently for now
        .subscribe();
    }
    this.logout();
  }
  logout() {
    this.wsService.command({ command: "signout" });
    this.applyLogout();
  }
  applyLogout() {
    this.clear();
    const navigationExtras: NavigationExtras =
      this.router.url === "/"
        ? {}
        : {
            queryParams: { next: this.router.url },
          };
    this.router.navigate(["/login"], navigationExtras).then();
  }

  refresh(tokens: Pick<Tokens, "refresh">): Observable<Tokens> {
    return this.http
      .post<Tokens>(`${this.url}/token/refresh`, {
        refresh: tokens.refresh,
      })
      .pipe(tap((value) => this.setToken(value)));
  }

  getToken(): Tokens {
    return {
      access: localStorage.getItem("token"),
      refresh: localStorage.getItem("refresh"),
      username: localStorage.getItem("username") || "",
    };
  }

  setToken(tokens: Tokens) {
    if (tokens.access) {
      localStorage.setItem("token", tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem("refresh", tokens.refresh);
    }
    if (tokens.username) {
      localStorage.setItem("username", tokens.username);
    }
    this.setupAutoLogout(tokens);
  }

  setupAutoLogout(tokens: Tokens) {
    if (this.autoLogoutSubscription) {
      this.autoLogoutSubscription.unsubscribe();
      this.autoLogoutSubscription = null;
    }
    if (tokens.refresh) {
      const expirationDate = this.jwtHelperService.getTokenExpirationDate(tokens.refresh);
      if (expirationDate) {
        this.autoLogoutSubscription = timer(expirationDate)
          .pipe(
            take(1),
            tap(() => {
              this.autoLogout();
            }),
          )
          .subscribe();
      }
    }
  }
  isLoginOk() {
    const tokens = this.getToken();
    if (tokens && tokens.refresh && !this.jwtHelperService.isTokenExpired(tokens.refresh)) {
      if (this.jwtHelperService.isTokenExpired(tokens.access)) {
        return this.refresh(tokens).pipe(
          map(() => true),
          catchError(() => of(false)),
        );
      } else {
        this.setupAutoLogout(tokens);
        return of(true);
      }
    } else {
      return of(false);
    }
  }

  private getConfig() {
    return this.http.get<BaseDataModel<AuthConfig>>(`${this.url}/config`);
  }

  async initConfig() {
    return await lastValueFrom(
      this.getConfig().pipe(
        tap((config) => debug("getConfig", "received", config)),
        tap((config) => this.configStore.setProviders(config.data.socialaccount.providers)),
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

  continueSignup(payload: ProviderContinueSignupPayload) {
    return this.http.post<ProviderCallback>(`${this.url}/provider/continue_signup`, payload);
  }
}
