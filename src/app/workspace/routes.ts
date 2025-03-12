/*
 * Copyright (C) 2024-2025 BIRU
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

import { ActivatedRouteSnapshot, Router, Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { ProjectDetailService } from "./project-detail/project-detail.service";
import { inject } from "@angular/core";
import { debug } from "../../libs/utils/functions/logging";
import { WorkspaceService } from "@tenzu/data/workspace";
import { HttpErrorResponse } from "@angular/common/http";
import { MembershipService } from "@tenzu/data/membership";

export function workspaceResolver(route: ActivatedRouteSnapshot) {
  debug("workspaceResolver", "start");
  const workspaceService = inject(WorkspaceService);
  const membershipService = inject(MembershipService);
  const router = inject(Router);
  const workspaceId = route.paramMap.get("workspaceId");
  if (workspaceId) {
    try {
      workspaceService.get(workspaceId).then();
      membershipService.listWorkspaceMembership(workspaceId).then();
      membershipService.listWorkspaceInvitations(workspaceId).then();
      membershipService.listWorkspaceGuest(workspaceId).then();
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        return router.navigate(["/404"]);
      }
      throw error;
    }
  }
  debug("workspaceResolver", "end");
  return true;
}

export function projectResolver(route: ActivatedRouteSnapshot) {
  debug("projectResolver", "start");
  const projectService = inject(ProjectDetailService);
  const projectId = route.paramMap.get("projectId");
  const workspaceId = route.paramMap.get("workspaceId");
  if (projectId && workspaceId) {
    projectService.load(workspaceId, projectId);
  }
  debug("projectResolver", "end");
}

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./workspace-list/workspace-list.component").then((m) => m.WorkspaceListComponent),
    providers: [provideTranslocoScope("workspace")],
  },
  {
    path: "workspace/:workspaceId",
    loadComponent: () => import("./detail-base/detail-base.component").then((m) => m.DetailBaseComponent),
    providers: [provideTranslocoScope("workspace", "workflow")],
    resolve: { workspace: workspaceResolver },
    children: [
      {
        path: "project/:projectId",
        loadComponent: () => import("./project-detail/project-detail.component").then((m) => m.ProjectDetailComponent),
        loadChildren: () => import("./project-detail/routes").then((m) => m.routes),
        providers: [provideTranslocoScope("workflow")],
        resolve: { project: projectResolver },
      },
      {
        path: "",
        loadComponent: () =>
          import("./workspace-detail/workspace-detail.component").then((m) => m.WorkspaceDetailComponent),

        loadChildren: () => import("./workspace-detail/routes").then((m) => m.routes),
      },
    ],
  },
];
