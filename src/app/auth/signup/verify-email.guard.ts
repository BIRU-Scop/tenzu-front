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

import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { map, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { VerificationInfo } from "@tenzu/repository/user/user.model";
import { UserService } from "@tenzu/repository/user/user.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";

function invitationUrl(verification: VerificationInfo): string | null {
  if (verification.workspaceInvitation) {
    return `/workspace/${verification.workspaceInvitation.workspace.id}/projects`;
  }
  if (verification.projectInvitation) {
    const { id, workspaceId } = verification.projectInvitation.project;
    return `/workspace/${workspaceId}/project/${id}`;
  }
  return null;
}

export const verifyEmailGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const sessionLifecycleService = inject(SessionLifecycleService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return userService.verifyUser(token).pipe(
    map((verification: VerificationInfo) => {
      if (sessionLifecycleService.step() === "loggedIn") {
        sessionLifecycleService.endSession({ reason: "logoutRequested" });
      }
      sessionLifecycleService.sessionStarted(verification.auth, invitationUrl(verification));
      return false;
    }),
    catchError((httpResponse: HttpErrorResponse) => {
      if (httpResponse.status === HttpStatusCode.NotFound) {
        void router.navigate(["/signup"]);
      } else if (httpResponse.status === HttpStatusCode.BadRequest) {
        void router.navigate(["/login"]);
      }
      return throwError(() => httpResponse);
    }),
  );
};
