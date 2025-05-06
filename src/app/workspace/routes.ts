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
import { inject } from "@angular/core";
import { debug } from "@tenzu/utils/functions/logging";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { HttpErrorResponse } from "@angular/common/http";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { WsService } from "@tenzu/utils/services/ws";

export function workspaceResolver(route: ActivatedRouteSnapshot) {
  debug("workspaceResolver", "start");
  const workspaceService = inject(WorkspaceRepositoryService);
  const workspaceMembershipService = inject(WorkspaceMembershipRepositoryService);
  const router = inject(Router);
  const workspaceId = route.paramMap.get("workspaceId");
  if (workspaceId) {
    try {
      workspaceService.getRequest({ workspaceId }).then();
      workspaceMembershipService.listWorkspaceMembership(workspaceId).then();
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

export function workspaceListProjectsResolver(route: ActivatedRouteSnapshot) {
  debug("workspaceListProjectsResolver", "start");
  const projectRepositoryService = inject(ProjectRepositoryService);

  const workspaceId = route.paramMap.get("workspaceId");
  if (workspaceId) {
    projectRepositoryService.listRequest({ workspaceId }).then();
  }
  debug("workspaceListProjectsResolver", "end");
}

export function projectResolver(route: ActivatedRouteSnapshot) {
  debug("projectResolver", "start");
  const projectId = route.paramMap.get("projectId");
  const wsService = inject(WsService);
  const projectRepositoryService = inject(ProjectRepositoryService);
  const projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  const router = inject(Router);
  if (projectId) {
    try {
      const oldProjectDetail = projectRepositoryService.entityDetail();
      if (oldProjectDetail && oldProjectDetail.id === projectId) {
        wsService.command({ command: "unsubscribe_from_project_events", project: oldProjectDetail.id });
      }
      projectRepositoryService.getRequest({ projectId }).then();
      projectMembershipRepositoryService.listProjectMembership(projectId).then();
      wsService.command({ command: "subscribe_to_project_events", project: projectId });
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        router.navigate(["/404"]).then();
      }
      throw error;
    }
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
        resolve: { projects: workspaceListProjectsResolver },

        loadChildren: () => import("./workspace-detail/routes").then((m) => m.routes),
      },
    ],
  },
];
