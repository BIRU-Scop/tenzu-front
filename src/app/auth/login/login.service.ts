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
