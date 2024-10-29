import { inject, Injectable } from "@angular/core";

import { tap } from "rxjs";
import { Router } from "@angular/router";
import { UserStore } from "@tenzu/data/user";
import { AuthService, Credential } from "@tenzu/data/auth";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  userStore = inject(UserStore);
  authService = inject(AuthService);
  router = inject(Router);

  checkPassword(credential: Credential) {
    this.authService.clear();
    return this.authService.login(credential);
  }

  login(credential: Credential, next: string) {
    this.authService.clear();
    return this.authService.login(credential).pipe(
      tap(() => this.userStore.getMe()),
      tap(() => this.router.navigateByUrl(next)),
    );
  }
}
