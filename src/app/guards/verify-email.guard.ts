/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { switchMap, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { UserService, UserStore, VerificationData } from "@tenzu/data/user";
import { AuthService } from "@tenzu/data/auth";

export const VerifyEmailGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const userStore = inject(UserStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  const verifyParam = route.params["token"] as string;

  return userService.verifyUsers(verifyParam).pipe(
    tap(async (verification: VerificationData) => {
      authService.clear();
      authService.setToken(verification.auth);
      userStore.getMe(); // No need to return here, it's just a side effect
    }),
    switchMap((verification: VerificationData) => {
      if (verification.workspaceInvitation) {
        const workspaceId = verification.workspaceInvitation.workspace.id;

        if (verification.projectInvitationToken) {
          const projectId = verification.projectInvitationToken.project.id;
          return router.navigateByUrl(`/workspace/${workspaceId}/project/${projectId}`);
        }
        return router.navigateByUrl(`/workspace/${workspaceId}/projects`);
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
