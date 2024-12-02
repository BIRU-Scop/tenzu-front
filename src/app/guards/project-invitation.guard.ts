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
import { ProjectInvitationInfo } from "@tenzu/data/workspace";
import { ProjectInfraService } from "@tenzu/data/project";
import { NotificationService } from "@tenzu/utils/services/notification";

export const ProjectInvitationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const projectService = inject(ProjectInfraService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const token = route.params["token"] as string;

  return projectService.getProjectInvitationInfo(token).pipe(
    switchMap((invitation: ProjectInvitationInfo) =>
      authService.isLoginOk().pipe(
        switchMap((logged) => {
          if (logged) {
            return projectService.acceptInvitation(token).pipe(
              map((invitAccept) =>
                router.parseUrl(`/workspace/${invitAccept.workspaceId}/project/${invitAccept.project.id}/kanban/main`),
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
      return authService.isLoginOk().pipe(map((logged) => (logged ? router.parseUrl("/") : router.parseUrl("/login"))));
    }),
  );
};
