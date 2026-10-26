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
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectInvitationsApiService } from "@tenzu/repository/project-invitations/project-invitation-api.service";
import { PublicProjectPendingInvitation } from "@tenzu/repository/project-invitations/project-invitation.model";

function isLoggedIn(tokenRepositoryService: TokenRepositoryService): Observable<boolean> {
  return from(tokenRepositoryService.getAccessToken()).pipe(map((access) => access !== null));
}

export const ProjectInvitationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenRepositoryService = inject(TokenRepositoryService);
  const projectInvitationApiService = inject(ProjectInvitationsApiService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return projectInvitationApiService.getByToken({ token }).pipe(
    switchMap((invitation: PublicProjectPendingInvitation) =>
      isLoggedIn(tokenRepositoryService).pipe(
        switchMap((logged) => {
          if (logged) {
            return projectInvitationApiService.acceptByToken({ token }).pipe(
              map((invitAccept) =>
                router.parseUrl(
                  `/workspace/${invitAccept.project.workspaceId}/project/${invitAccept.project.id}/kanban/main`,
                ),
              ),
              catchError((err) => {
                notificationService.error({ title: err });
                return of(false);
              }),
            );
          } else {
            if (invitation.existingUser) {
              const urlTree = router.parseUrl("/login");
              urlTree.queryParams = {
                next: `/accept-project-invitation/${token}`,
              };
              return of(urlTree);
            } else {
              const urlTree = router.parseUrl("/signup");
              urlTree.queryParams = {
                email: invitation.email,
                acceptProjectInvitation: true,
                projectInvitationToken: token,
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
