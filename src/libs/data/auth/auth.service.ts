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
