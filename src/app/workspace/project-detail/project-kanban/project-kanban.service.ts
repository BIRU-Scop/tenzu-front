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
import { StoryCreate, StoryStore } from "@tenzu/data/story";
import { Status } from "@tenzu/data/status";
import { Router } from "@angular/router";
import { ProjectService } from "@tenzu/data/project";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";

/**
 * This service create a modal positioned relatively to its trigger button
 */
@Injectable({
  providedIn: "root",
})
export class ProjectKanbanService {
  projectService = inject(ProjectService);
  workflowService = inject(WorkflowService);
  storyStore = inject(StoryStore);
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
        this.storyStore.deleteStatusGroup(statusId, newStatus);
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
      await this.storyStore.create(selectedProject.id, selectedWorkflow.slug, story);
    }
  }

  async assignStory(username: string, projectId: string | null = null, storyRef: number | null = null) {
    const pId = projectId ? projectId : this.projectService.selectedEntity()?.id;
    const ref = storyRef ? storyRef : this.storyStore.selectedStoryDetails().ref;
    if (pId) {
      await this.storyStore.createAssign(pId, ref, username);
    }
  }

  async removeAssignStory(username: string, projectId: string | null = null, storyRef: number | null = null) {
    const pId = projectId ? projectId : this.projectService.selectedEntity()?.id;
    const ref = storyRef ? storyRef : this.storyStore.selectedStoryDetails().ref;
    if (pId) {
      await this.storyStore.deleteAssign(pId, ref, username);
    }
  }
}
