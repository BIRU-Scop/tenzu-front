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

import { ActivatedRouteSnapshot, Router, Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { inject } from "@angular/core";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { ProjectStore } from "@tenzu/data/project";
import { WorkflowStore } from "@tenzu/data/workflow/workflow.store";
import { MembershipStore } from "@tenzu/data/membership";
import { HttpErrorResponse } from "@angular/common/http";

export async function workspaceResolver(route: ActivatedRouteSnapshot) {
  const workspaceStore = inject(WorkspaceStore);
  const membershipStore = inject(MembershipStore);
  const router = inject(Router);
  try {
    return Promise.all([
      workspaceStore.get(route.paramMap.get("id")!),
      membershipStore.listWorkspaceMembership(route.paramMap.get("id")!),
      membershipStore.listWorkspaceInvitations(route.paramMap.get("id")!),
      membershipStore.listWorkspaceGuest(route.paramMap.get("id")!),
    ]);
  } catch (error) {
    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
      return router.navigate(["/404"]);
    }
    throw error;
  }
}

export async function projectByWorkspaceResolver(route: ActivatedRouteSnapshot) {
  const projectStore = inject(ProjectStore);
  const workflowStore = inject(WorkflowStore);
  const membershipStore = inject(MembershipStore);
  const router = inject(Router);

  try {
    projectStore.reset();
    return Promise.all([
      projectStore
        .getProject(route.paramMap.get("projectId")!)
        .then((project) => workflowStore.setWorkflows(project.workflows)),
      membershipStore.listProjectMembership(route.paramMap.get("projectId")!),
      membershipStore.listProjectInvitations(route.paramMap.get("projectId")!),
    ]);
  } catch (error) {
    if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
      return router.navigate(["/404"]);
    }
    throw error;
  }
}

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./workspace-list/workspace-list.component").then((m) => m.WorkspaceListComponent),
    providers: [provideTranslocoScope("workspace")],
  },
  {
    path: "workspace/:id",
    loadComponent: () => import("./detail-base/detail-base.component").then((m) => m.DetailBaseComponent),
    providers: [provideTranslocoScope("workspace", "workflow")],
    resolve: { workspace: workspaceResolver },
    children: [
      {
        path: "project/:projectId",
        loadComponent: () => import("./project-detail/project-detail.component").then((m) => m.ProjectDetailComponent),

        loadChildren: () => import("./project-detail/routes").then((m) => m.routes),
        providers: [provideTranslocoScope("workflow")],
        resolve: { project: projectByWorkspaceResolver },
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
