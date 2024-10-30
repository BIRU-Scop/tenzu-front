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
import { inject } from "@angular/core";

import { ProjectStore } from "@tenzu/data/project";

export async function projectByWorkspaceResolver(route: ActivatedRouteSnapshot) {
  const projectStore = inject(ProjectStore);
  return await projectStore.getProjectsByWorkspaceId(route.paramMap.get("id")!);
}

export const routes: Routes = [
  {
    path: "",
    redirectTo: "projects",
    pathMatch: "prefix",
  },
  {
    path: "projects",
    loadComponent: () =>
      import("./workspace-project-list/workspace-project-list.component").then((m) => m.WorkspaceProjectListComponent),
    resolve: {
      projects: projectByWorkspaceResolver,
    },
  },
  {
    path: "people",
    loadComponent: () =>
      import("./workspace-people/workspace-people.component").then((m) => m.WorkspacePeopleComponent),
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./workspace-settings/workspace-settings.component").then((m) => m.WorkspaceSettingsComponent),
  },
];
