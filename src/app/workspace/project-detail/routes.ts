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
import { inject, signal } from "@angular/core";
import { provideTranslocoScope } from "@jsverse/transloco";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow/workflow-repository.service";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";

export function storyResolver(route: ActivatedRouteSnapshot) {
  const workflowService = inject(WorkflowRepositoryService);
  const storyService = inject(StoryRepositoryService);
  const router = inject(Router);
  const projectId = route.paramMap.get("projectId");
  if (projectId) {
    debug("[storyResolver]", "load start");
    storyService
      .getRequest({ projectId, ref: parseInt(route.paramMap.get("ref") || "", 10) })
      .then((story) => {
        workflowService
          .getRequest({ workflowId: story.workflowId })
          .then((workflow) =>
            storyService.listRequest(
              { projectId: projectId, workflowSlug: workflow?.slug || "" },
              { offset: 0, limit: 100 },
            ),
          )
          .then();
      })
      .catch((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
          return router.navigate(["/404"]);
        }
        throw error;
      });
    debug("[storyResolver]", "load end");
  }
  return true;
}
export function workflowResolver(route: ActivatedRouteSnapshot) {
  const projectId = route.paramMap.get("projectId");
  const workflowSLug = route.paramMap.get("workflowSlug");
  const workflowService = inject(WorkflowRepositoryService);
  const storyService = inject(StoryRepositoryService);
  const router = inject(Router);
  const limit = signal(100);
  const offset = 0;
  if (projectId && workflowSLug) {
    debug("workflowResolver", "load start");
    storyService.resetEntityDetail();
    workflowService
      .getBySlugRequest({
        projectId: projectId,
        slug: workflowSLug,
      })
      .then((workflow) => {
        debug("story", "load stories start");
        if (workflow) {
          storyService
            .listRequest({ projectId: workflow.projectId, workflowSlug: workflow.slug }, { offset, limit: limit() })
            .then();
        }
        debug("story", "load stories end");
      })
      .catch((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
          router.navigate(["/404"]).then();
        }
        throw error;
      });
    debug("workflowResolver", "load end");
  }
  return true;
}

export const routes: Routes = [
  {
    path: "",
    redirectTo: "kanban/main",
    pathMatch: "prefix",
  },
  {
    path: "kanban/:workflowSlug",
    loadComponent: () => import("./kanban-wrapper/kanban-wrapper.component"),
    providers: [provideTranslocoScope("workflow")],
    resolve: { workflow: workflowResolver },
    data: { reuseComponent: true },
  },
  {
    path: "story/:ref",
    loadComponent: () => import("./kanban-wrapper/kanban-wrapper.component"),
    // loadComponent: () => import("./story-detail/story-detail.component"),
    providers: [provideTranslocoScope("workflow")],
    resolve: { story: storyResolver },
    data: { reuseComponent: true },
  },
  {
    path: "new-workflow",
    loadComponent: () =>
      import("./project-kanban-create/project-kanban-create.component").then((m) => m.ProjectKanbanCreateComponent),
    providers: [provideTranslocoScope("workflow")],
  },
  {
    path: "members",
    loadComponent: () => import("./project-members/project-members.component").then((m) => m.ProjectMembersComponent),
    providers: [provideTranslocoScope("project")],
  },
  {
    path: "settings",

    children: [
      {
        path: "",
        loadComponent: () => import("./project-settings/project-settings.component"),
        loadChildren: () => import("./project-settings/routes"),
      },
    ],
    providers: [provideTranslocoScope("project")],
  },
];
