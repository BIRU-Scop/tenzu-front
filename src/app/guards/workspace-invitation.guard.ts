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

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { AuthService } from "@tenzu/data/auth";
import { WorkspaceInvitationInfo, WorkspaceService } from "@tenzu/data/workspace";

export const WorkspaceInvitationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return workspaceService.getInvitationDetail(token).pipe(
    switchMap((invitation: WorkspaceInvitationInfo) =>
      authService.isLoginOk().pipe(
        switchMap((logged) => {
          if (logged) {
            return workspaceService.acceptInvitation(token).pipe(
              map(() => router.parseUrl(`/workspace/${invitation.workspace.id}/projects`)),
              catchError(() => of(false)), // TODO: Handle error when accepting invitation fails
            );
          } else {
            if (invitation.existingUser) {
              const urlTree = router.parseUrl("/login");
              urlTree.queryParams = {
                next: `/accept-workspace-invitation/${token}`,
              };
              return of(urlTree);
            } else {
              const urlTree = router.parseUrl("/signup");
              urlTree.queryParams = {
                workspace: invitation.workspace.name,
                email: invitation.email,
                acceptWorkspaceInvitation: true,
                workspaceInvitationToken: token,
              };
              return of(urlTree);
            }
          }
        }),
      ),
    ),
    catchError(() => {
      // Handle error when getting invitation details fails
      return authService.isLoginOk().pipe(map((logged) => (logged ? router.parseUrl("/") : router.parseUrl("/login"))));
    }),
  );
};
