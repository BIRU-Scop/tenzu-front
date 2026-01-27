/*
 * Copyright (C) 2025-2026 BIRU
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

import { inject, Injectable } from "@angular/core";
import { KanbanWrapperStore, StoryDisplayMode } from "./kanban-wrapper.store";
import { StoryRepositoryService } from "@tenzu/repository/story";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow";
import { HttpErrorResponse } from "@angular/common/http";
import { StoryCommentRepositoryService } from "@tenzu/repository/story-comment";

@Injectable({
  providedIn: "root",
})
export class KanbanWrapperService {
  private kanbanWrapperStore = inject(KanbanWrapperStore);
  storyDisplayMode = this.kanbanWrapperStore.storyDisplayMode;
  workflowRepositoryService = inject(WorkflowRepositoryService);
  storyRepositoryService = inject(StoryRepositoryService);
  storyCommentRepositoryService = inject(StoryCommentRepositoryService);

  isKanbanView = this.kanbanWrapperStore.isKanbanView;
  isFullViewOpen = this.kanbanWrapperStore.isFullViewOpen;
  isModalViewOpen = this.kanbanWrapperStore.isModalViewOpen;
  isSideViewOpen = this.kanbanWrapperStore.isSideViewOpen;

  setStoryDisplayMode(storyView: StoryDisplayMode) {
    this.kanbanWrapperStore.setStoryDisplayMode(storyView);
  }

  async loadStoryDetail({
    projectId,
    storyRef,
    isFullViewOpen,
  }: {
    projectId: string;
    storyRef: number;
    isFullViewOpen: boolean;
  }) {
    this.storyRepositoryService.isLoading.set(true);
    try {
      const storyDetail = await this.storyRepositoryService.getRequest({ projectId, ref: storyRef });
      const workflow = await this.workflowRepositoryService.getRequest({ workflowId: storyDetail.workflowId });
      if (!isFullViewOpen) {
        await this.storyRepositoryService.listRequest(
          {
            projectId: projectId,
            workflowId: workflow.id,
          },
          { offset: 0, limit: 100 },
        );
      }
    } finally {
      this.storyRepositoryService.isLoading.set(false);
    }
  }
  async loadStoryComments({ projectId, storyRef }: { projectId: string; storyRef: number }) {
    this.storyCommentRepositoryService.resetAll();
    this.storyCommentRepositoryService
      .listRequest({
        projectId: projectId,
        ref: storyRef,
      })
      .catch((error) => {
        if (error instanceof HttpErrorResponse && error.status === 403) {
          return;
        }
        throw error;
      });
  }
  async loadWorkflowAndStories({ projectId, workflowSLug }: { projectId: string; workflowSLug: string }) {
    const oldWorkflowDetail = this.workflowRepositoryService.entityDetail();
    if (
      projectId &&
      workflowSLug &&
      (oldWorkflowDetail?.projectId != projectId || oldWorkflowDetail?.slug != workflowSLug)
    ) {
      this.storyRepositoryService.isLoading.set(true);
      this.workflowRepositoryService.resetEntityDetail();
      this.storyRepositoryService.resetAll();
      try {
        const workflow = await this.workflowRepositoryService.getBySlugRequest({
          projectId: projectId,
          slug: workflowSLug,
        });

        if (workflow) {
          await this.storyRepositoryService.listRequest(
            {
              projectId: workflow.projectId,
              workflowId: workflow.id,
            },
            { offset: 0, limit: 100 },
          );
          this.storyRepositoryService.isLoading.set(false);
        }
      } finally {
        this.storyRepositoryService.isLoading.set(false);
      }
    }
  }
}
