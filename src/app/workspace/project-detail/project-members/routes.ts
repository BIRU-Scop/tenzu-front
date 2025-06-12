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
import { debug } from "@tenzu/utils/functions/logging";
import { inject } from "@angular/core";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";

export function projectListInvitationsResolver(route: ActivatedRouteSnapshot) {
  debug("projectListInvitationsResolver", "start");
  const projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);

  const projectId = route.paramMap.get("projectId");
  if (projectId) {
    projectInvitationRepositoryService.listProjectInvitations(projectId).then();
  }
  debug("projectListInvitationsResolver", "end");
}

const routes: Routes = [
  {
    path: "",
    redirectTo: "list-project-members",
    pathMatch: "prefix",
  },
  {
    path: "list-project-members",
    loadComponent: () => import("./project-members-list.component"),
  },
  {
    path: "list-project-invitations",
    loadComponent: () => import("./project-invitations-list.component"),
    resolve: { invitations: projectListInvitationsResolver },
  },
];

export default routes;
