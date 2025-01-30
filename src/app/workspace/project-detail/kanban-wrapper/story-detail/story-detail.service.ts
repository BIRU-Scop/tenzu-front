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

import { inject, Injectable } from "@angular/core";
import { ProjectService } from "@tenzu/data/project";
import { StoryUpdate } from "@tenzu/data/story";
import { Router } from "@angular/router";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";
import { StoryService } from "@tenzu/data/story/story.service";

@Injectable({
  providedIn: "root",
})
export class StoryDetailService {
  projectService = inject(ProjectService);
  workflowService = inject(WorkflowService);
  storyService = inject(StoryService);
  router = inject(Router);

  async patchSelectedStory(data: Partial<StoryUpdate>) {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    if (project && story) {
      return this.storyService.updateSelected(
        {
          ...story,
          ...data,
          version: story.version,
          ref: story.ref,
        },
        project.id,
      );
    }
    throw new Error("No story to update");
  }
  async changeWorkflowSelectedStory(data: Partial<StoryUpdate>) {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    const req = {
      ...story,
      ...data,
    };
    if (project) {
      delete req.statusId;
      return this.storyService.updateSelected({ ...req }, project.id);
    }
    return undefined;
  }

  async deleteSelectedStory() {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    const workflow = this.workflowService.selectedEntity();
    if (project && story && workflow) {
      await this.storyService.deleteSelected(project!.id, story!.ref);
      await this.router.navigateByUrl(
        `/workspace/${project?.workspaceId}/project/${project.id}/kanban/${workflow.slug}`,
      );
    }
  }

  public async addAttachment(file: File) {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    if (project && story) {
      await this.storyService.createAttachment(project.id, story.ref, file);
    }
  }

  public async deleteAttachment(id: string) {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    if (project && story) {
      await this.storyService.deleteAttachment(project.id, story.ref, id);
    }
  }

  public getStoryAttachmentUrlBack(attachmentId: string) {
    const project = this.projectService.selectedEntity();
    const story = this.storyService.selectedEntity();
    if (project && story) {
      return this.storyService.getStoryAttachmentUrl(project.id, story.ref, attachmentId);
    } else {
      return "";
    }
  }
}
