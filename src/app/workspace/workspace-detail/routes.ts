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

import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { debug } from "@tenzu/utils/functions/logging";
import { inject } from "@angular/core";
import { WorkspaceService } from "@tenzu/data/workspace";

export function workspaceListProjectsResolver(route: ActivatedRouteSnapshot) {
  debug("workspaceListProjectsResolver", "start");
  const workspaceService = inject(WorkspaceService);
  const workspaceId = route.paramMap.get("workspaceId");
  if (workspaceId) {
    workspaceService.getProjectsByWorkspace(workspaceId);
  }
  debug("workspaceListProjectsResolver", "end");
}
export const routes: Routes = [
  {
    path: "",
    redirectTo: "projects",
    pathMatch: "prefix",
  },
  {
    path: "projects",
    loadComponent: () => import("./workspace-project-list/workspace-project-list.component"),
    resolve: { projects: workspaceListProjectsResolver },
  },
  {
    path: "people",
    loadComponent: () => import("./workspace-people/workspace-people.component"),
  },
  {
    path: "settings",
    loadComponent: () => import("./workspace-settings/workspace-settings.component"),
  },
];
