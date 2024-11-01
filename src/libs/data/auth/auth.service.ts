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
import { environment } from "../../../environments/environment";
import { Credential, Tokens } from "./auth.model";
import { map, of, tap } from "rxjs";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  jwtHelperService = inject(JwtHelperService);
  http = inject(HttpClient);
  url = `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}/auth`;
  router = inject(Router);

  login(credentials: Credential) {
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
  }

  logout() {
    this.clear();
    return this.router.navigateByUrl("/login");
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
      token: localStorage.getItem("token"),
      refresh: localStorage.getItem("refresh"),
      username: localStorage.getItem("username") || "",
    };
  }

  setToken(tokens: Tokens) {
    if (tokens.token) {
      localStorage.setItem("token", tokens.token);
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
      if (this.jwtHelperService.isTokenExpired(tokens.token)) {
        return this.refresh(tokens).pipe(map(() => true));
      } else {
        return of(true);
      }
    } else {
      return of(false);
    }
  }
}
