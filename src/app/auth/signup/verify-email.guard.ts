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

import { HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { switchMap, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { UserService, UserStore, VerificationInfo } from "@tenzu/repository/user";
import { AuthService } from "@tenzu/repository/auth";

export const VerifyEmailGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const userStore = inject(UserStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  const verifyParam = route.params["token"] as string;

  return userService.verifyUsers(verifyParam).pipe(
    tap(async (verification: VerificationInfo) => {
      authService.clear();
      authService.setToken(verification.auth);
      userStore.getMe(); // No need to return here, it's just a side effect
    }),
    switchMap((verification: VerificationInfo) => {
      if (verification.workspaceInvitation) {
        const workspaceId = verification.workspaceInvitation.workspace.id;
        return router.navigateByUrl(`/workspace/${workspaceId}/projects`);
      }
      if (verification.projectInvitationToken) {
        const projectId = verification.projectInvitationToken.project.id;
        const workspaceId = verification.projectInvitationToken.project.workspaceId;
        return router.navigateByUrl(`/workspace/${workspaceId}/project/${projectId}`);
      }
      return router.navigateByUrl("/");
    }),
    catchError((httpResponse: HttpErrorResponse) => {
      if (httpResponse.status === 404) {
        // Manage error case for 404
        void router.navigate(["/signup"]);
      } else if (httpResponse.status === 400) {
        void router.navigate(["/login"]);
      }
      return throwError(() => httpResponse);
    }),
  );
};
