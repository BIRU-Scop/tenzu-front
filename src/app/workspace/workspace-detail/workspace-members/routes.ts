/*
 * Copyright (C) 2025 BIRU
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

import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { debug } from "@tenzu/utils/functions/logging";
import { inject } from "@angular/core";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";

export function workspaceListInvitationsResolver(route: ActivatedRouteSnapshot) {
  debug("workspaceListInvitationsResolver", "start");
  const workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);

  const workspaceId = route.paramMap.get("workspaceId");
  if (workspaceId) {
    workspaceInvitationRepositoryService.listWorkspaceInvitations(workspaceId).then();
  }
  debug("workspaceListInvitationsResolver", "end");
}

const routes: Routes = [
  {
    path: "",
    redirectTo: "list-workspace-members",
    pathMatch: "prefix",
  },
  {
    path: "list-workspace-members",
    loadComponent: () => import("./workspace-members-list.component"),
    providers: [provideTranslocoScope("workspace")],
  },
  {
    path: "list-workspace-invitations",
    loadComponent: () => import("./workspace-invitations-list.component"),
    providers: [provideTranslocoScope("workspace")],
    resolve: { invitations: workspaceListInvitationsResolver },
  },
];

export default routes;
