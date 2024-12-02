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
import { inject } from "@angular/core";
import { StoryStore } from "@tenzu/data/story";
import { provideTranslocoScope } from "@jsverse/transloco";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "../../../libs/utils/functions/logging";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";

export function storyResolver(route: ActivatedRouteSnapshot) {
  const workflowService = inject(WorkflowService);
  const storyStore = inject(StoryStore);
  const router = inject(Router);
  const projectId = route.paramMap.get("projectId");
  if (projectId) {
    try {
      storyStore
        .get(projectId, parseInt(route.paramMap.get("ref") || "", 10))
        .then((story) => {
          if (workflowService.selectedEntity()?.id != story.workflowId) {
            workflowService.get(projectId, story.workflowId).then();
          }
        })
        .then();
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        return router.navigate(["/404"]);
      }
      throw error;
    }
  }
  return true;
}
export function workflowResolver(route: ActivatedRouteSnapshot) {
  const projectId = route.paramMap.get("projectId")!;
  const workflowSLug = route.paramMap.get("workflowSlug")!;
  const workflowService = inject(WorkflowService);
  const router = inject(Router);
  if (projectId && workflowSLug) {
    debug("workflowResolver", "load start");
    try {
      workflowService
        .getBySlug({
          projectId: projectId,
          slug: workflowSLug,
        })
        .then();
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
        router.navigate(["/404"]).then();
      }
      throw error;
    }
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
    loadComponent: () => import("./project-kanban/project-kanban.component").then((m) => m.ProjectKanbanComponent),
    providers: [provideTranslocoScope("workflow")],
    resolve: { workflow: workflowResolver },
  },
  {
    path: "story/:ref",
    loadComponent: () => import("./story-detail/story-detail.component").then((m) => m.StoryDetailComponent),
    providers: [provideTranslocoScope("workflow")],
    resolve: { story: storyResolver },
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
    loadComponent: () =>
      import("./project-settings/project-settings.component").then((m) => m.ProjectSettingsComponent),
    providers: [provideTranslocoScope("project")],
  },
];
