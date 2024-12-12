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

import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Credential, Tokens } from "./auth.model";
import { map, of, tap } from "rxjs";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { WsService } from "@tenzu/utils/services/ws";
import { clearAuthStorage } from "@tenzu/data/auth/utils";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  jwtHelperService = inject(JwtHelperService);
  configAppService = inject(ConfigAppService);
  wsService = inject(WsService);
  http = inject(HttpClient);
  router = inject(Router);
  url: string = `${this.configAppService.apiUrl()}auth`;

  login(credentials: Credential) {
    return this.http
      .post<Tokens>(`${this.url}/token`, {
        ...credentials,
      })
      .pipe(tap((value) => this.setToken(value)));
  }

  clear() {
    clearAuthStorage();
  }

  logout() {
    this.wsService.command({ command: "signout" });
  }

  refresh(tokens: Tokens) {
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
  }
  isLoginOk() {
    const tokens = this.getToken();
    if (tokens && tokens.refresh) {
      if (this.jwtHelperService.isTokenExpired(tokens.access)) {
        return this.refresh(tokens).pipe(map(() => true));
      } else {
        return of(true);
      }
    } else {
      return of(false);
    }
  }
}
