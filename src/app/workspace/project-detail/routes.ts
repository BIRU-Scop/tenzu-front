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
import { inject } from "@angular/core";
import { provideTranslocoScope } from "@jsverse/transloco";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow/workflow-repository.service";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import { KanbanWrapperService } from "./kanban-wrapper/kanban-wrapper.service";
import { StoryCommentRepositoryService } from "@tenzu/repository/story-comment";

async function loadStoryComments(
  storyCommentRepositoryService: StoryCommentRepositoryService,
  projectId: string,
  storyRef: number,
) {
  storyCommentRepositoryService.resetAll();
  return storyCommentRepositoryService.listRequest({
    projectId: projectId,
    ref: storyRef,
  });
}

export function storyResolver(route: ActivatedRouteSnapshot) {
  const workflowRepositoryService = inject(WorkflowRepositoryService);
  const storyRepositoryService = inject(StoryRepositoryService);
  const storyCommentRepositoryService = inject(StoryCommentRepositoryService);
  const router = inject(Router);
  const projectId = route.paramMap.get("projectId");
  const storyRef = parseInt(route.paramMap.get("ref") || "", 10);
  const oldStoryDetail = storyRepositoryService.entityDetail();
  debug("storyResolver", "load start", `${projectId}-${storyRef}`);
  if (projectId && (oldStoryDetail?.ref != storyRef || oldStoryDetail.projectId != projectId)) {
    storyRepositoryService.isLoading.set(true);
    storyRepositoryService.resetEntityDetail();
    storyRepositoryService
      .getRequest({ projectId, ref: storyRef })
      .then((story) => {
        loadStoryComments(storyCommentRepositoryService, projectId, storyRef).then();
        const oldWorkflowDetail = workflowRepositoryService.entityDetail();
        if (oldWorkflowDetail?.id != story.workflowId) {
          workflowRepositoryService.resetEntityDetail();
          workflowRepositoryService
            .getRequest({ workflowId: story.workflowId })
            .then((workflow) =>
              storyRepositoryService.listRequest(
                {
                  projectId: projectId,
                  workflowId: workflow.id,
                },
                { offset: 0, limit: 100 },
              ),
            )
            .then(() => storyRepositoryService.isLoading.set(false));
        } else {
          storyRepositoryService.isLoading.set(false);
        }
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
  const workflowRepositoryService = inject(WorkflowRepositoryService);
  const storyRepositoryService = inject(StoryRepositoryService);
  const router = inject(Router);
  const oldWorkflowDetail = workflowRepositoryService.entityDetail();
  const kanbanWrapperService = inject(KanbanWrapperService);
  kanbanWrapperService.closeOpenedSideview();
  debug("workflowResolver", "load start", workflowSLug);
  if (
    projectId &&
    workflowSLug &&
    (oldWorkflowDetail?.slug != workflowSLug || oldWorkflowDetail.projectId != projectId)
  ) {
    storyRepositoryService.isLoading.set(true);
    workflowRepositoryService.resetEntityDetail();
    storyRepositoryService.resetAll();
    workflowRepositoryService
      .getBySlugRequest({
        projectId: projectId,
        slug: workflowSLug,
      })
      .then((workflow) => {
        if (workflow) {
          storyRepositoryService
            .listRequest(
              {
                projectId: workflow.projectId,
                workflowId: workflow.id,
              },
              { offset: 0, limit: 100 },
            )
            .then(() => storyRepositoryService.isLoading.set(false));
        }
      })
      .catch((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
          router.navigate(["/404"]).then();
        }
        throw error;
      });
    debug("workflowResolver", "load end");
  } else {
    storyRepositoryService.resetEntityDetail();
  }
  return true;
}

export const routes: Routes = [
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
    providers: [provideTranslocoScope("workflow")],
    resolve: { story: storyResolver },
    data: { reuseComponent: true },
  },
  {
    path: "new-workflow",
    loadComponent: () => import("./project-kanban-create/project-kanban-create.component"),
    providers: [provideTranslocoScope("workflow")],
  },
  {
    path: "members",
    children: [
      {
        path: "",
        loadComponent: () => import("./project-members/project-members.component"),
        loadChildren: () => import("./project-members/routes"),
      },
    ],
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
