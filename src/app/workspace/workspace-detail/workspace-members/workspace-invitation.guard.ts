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

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { from, map, Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { WorkspaceInvitationsApiService } from "@tenzu/repository/workspace-invitations/workspace-invitation-api-service";
import { PublicWorkspacePendingInvitation } from "@tenzu/repository/workspace-invitations/workspace-invitation.model";

function isLoggedIn(tokenRepositoryService: TokenRepositoryService): Observable<boolean> {
  return from(tokenRepositoryService.getAccessToken()).pipe(map((access) => access !== null));
}

export const WorkspaceInvitationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenRepositoryService = inject(TokenRepositoryService);
  const workspaceInvitationsApiService = inject(WorkspaceInvitationsApiService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return workspaceInvitationsApiService.getByToken({ token }).pipe(
    switchMap((invitation: PublicWorkspacePendingInvitation) =>
      isLoggedIn(tokenRepositoryService).pipe(
        switchMap((logged) => {
          if (logged) {
            return workspaceInvitationsApiService.acceptByToken({ token }).pipe(
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
      return isLoggedIn(tokenRepositoryService).pipe(
        map((logged) => (logged ? router.parseUrl("/") : router.parseUrl("/login"))),
      );
    }),
  );
};
