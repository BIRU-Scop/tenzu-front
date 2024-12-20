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

import { inject, Injectable } from "@angular/core";
import { StoryCreate } from "@tenzu/data/story";
import { Status } from "@tenzu/data/status";
import { Router } from "@angular/router";
import { ProjectService } from "@tenzu/data/project";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";
import { StoryService } from "@tenzu/data/story/story.service";
import { WorkspaceService } from "@tenzu/data/workspace";

/**
 * This service create a modal positioned relatively to its trigger button
 */
@Injectable({
  providedIn: "root",
})
export class ProjectKanbanService {
  workspaceService = inject(WorkspaceService);
  projectService = inject(ProjectService);
  workflowService = inject(WorkflowService);
  storyService = inject(StoryService);
  router = inject(Router);

  public async createStatus(status: Pick<Status, "name" | "color">) {
    const selectedProject = this.projectService.selectedEntity();
    if (selectedProject) {
      await this.workflowService.createStatus(selectedProject.id, status);
    }
  }

  public async deleteStatus(statusId: string, moveToStatus?: string) {
    const selectedProject = this.projectService.selectedEntity();
    if (selectedProject) {
      await this.workflowService.deleteStatus(selectedProject.id, statusId, moveToStatus);
      const newStatus = this.workflowService.selectedEntity()?.statuses.find((status) => status.id === moveToStatus);
      if (newStatus) {
        this.storyService.deleteStatusGroup(statusId, newStatus);
      }
    }
  }

  public async editStatus(status: Pick<Status, "name" | "id">) {
    const selectedProject = this.projectService.selectedEntity();
    if (selectedProject) {
      await this.workflowService.editStatus(selectedProject.id, status);
    }
  }

  public async createStory(story: StoryCreate) {
    const selectedProject = this.projectService.selectedEntity();
    const selectedWorkflow = this.workflowService.selectedEntity();
    if (selectedProject && selectedWorkflow) {
      await this.storyService.create(story, selectedProject.id, selectedWorkflow.slug);
    }
  }

  async assignStory(username: string, projectId: string, storyRef: number) {
    await this.storyService.createAssign(projectId, storyRef, username);
  }

  async removeAssignStory(username: string, projectId: string, storyRef: number) {
    await this.storyService.deleteAssign(projectId, storyRef, username);
  }
}
