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

import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { AuthService } from "@tenzu/data/auth";

export const loginGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authRoutes = ["login", "reset-password", "signup"];
  const currentUrl = route.routeConfig?.path ? route.routeConfig.path : "";

  return authService.isLoginOk().pipe(
    tap((value) => {
      if (!value) {
        authService.logout();
      } else if (route.routeConfig && authRoutes.includes(currentUrl)) {
        router.navigateByUrl("/");
      }
    }),
    catchError(() => {
      authService.logout();
      return of(false);
    }),
  );
};
