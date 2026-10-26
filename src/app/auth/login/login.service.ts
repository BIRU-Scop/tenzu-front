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

import { inject, Service } from "@angular/core";

import { tap } from "rxjs";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { AuthService } from "@tenzu/repository/auth/auth.service";
import { Credential } from "@tenzu/repository/auth/auth.model";
import { usableNext } from "@tenzu/utils/functions/urls";

@Service()
export class LoginService {
  sessionLifecycleService = inject(SessionLifecycleService);
  authService = inject(AuthService);

  login(credential: Credential, next: string) {
    return this.authService.login(credential).pipe(
      tap((tokens) => {
        this.sessionLifecycleService.sessionStarted(tokens, usableNext(next));
      }),
    );
  }
}
