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
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { StoryUpdate } from "@tenzu/repository/story";
import { Router } from "@angular/router";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow/workflow-repository.service";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";

@Injectable({
  providedIn: "root",
})
export class StoryDetailService {
  projectService = inject(ProjectRepositoryService);
  workflowService = inject(WorkflowRepositoryService);
  storyService = inject(StoryRepositoryService);
  router = inject(Router);

  async patchSelectedStory(data: Partial<StoryUpdate>) {
    const project = this.projectService.entityDetail();
    const story = this.storyService.entityDetail();
    if (project && story) {
      return this.storyService.patchRequest(
        story.ref,
        {
          ...data,
          version: story.version,
        },
        { projectId: project.id, ref: story.ref },
      );
    }
    throw new Error("No story to update");
  }

  async changeWorkflowSelectedStory(data: Partial<StoryUpdate>) {
    const project = this.projectService.entityDetail();
    const story = this.storyService.entityDetail();
    if (project && story) {
      const req = {
        ...data,
        version: story.version,
      };
      delete req.statusId;
      return this.storyService.patchRequest(story.ref, { ...req }, { projectId: project.id, ref: story.ref });
    }
    return undefined;
  }

  async deleteSelectedStory() {
    const project = this.projectService.entityDetail();
    const story = this.storyService.entityDetail();
    const workflow = this.workflowService.entityDetail();
    if (project && story && workflow) {
      await this.storyService.deleteRequest(story, { projectId: project.id, ref: story.ref });
      await this.router.navigateByUrl(
        `/workspace/${project?.workspaceId}/project/${project.id}/kanban/${workflow.slug}`,
      );
    }
  }
}
