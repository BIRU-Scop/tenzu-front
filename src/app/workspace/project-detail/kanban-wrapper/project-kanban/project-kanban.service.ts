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
import { StoryCreate } from "@tenzu/repository/story";
import { Status } from "@tenzu/repository/status";
import { Router } from "@angular/router";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow/workflow-repository.service";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { Workflow } from "@tenzu/repository/workflow";

/**
 * This service create a modal positioned relatively to its trigger button
 */
@Injectable({
  providedIn: "root",
})
export class ProjectKanbanService {
  workspaceService = inject(WorkspaceRepositoryService);
  projectService = inject(ProjectRepositoryService);
  workflowService = inject(WorkflowRepositoryService);
  storyService = inject(StoryRepositoryService);
  router = inject(Router);

  public async createStatus(status: Pick<Status, "name" | "color">) {
    const selectedProject = this.projectService.entityDetail();
    if (selectedProject) {
      await this.workflowService.createStatus(selectedProject.id, status);
    }
  }

  public async deleteStatus(statusId: string, moveToStatus?: string) {
    const selectedProject = this.projectService.entityDetail();
    if (selectedProject) {
      await this.workflowService.deleteStatus(selectedProject.id, statusId, moveToStatus);
      const newStatus = this.workflowService.entityDetail()?.statuses.find((status) => status.id === moveToStatus);
      if (newStatus) {
        this.storyService.deleteStatusGroup(statusId, newStatus);
      }
    }
  }

  public async editStatus(status: Pick<Status, "name" | "id">) {
    const selectedProject = this.projectService.entityDetail();
    if (selectedProject) {
      await this.workflowService.editStatus(selectedProject.id, status);
    }
  }

  public async createStory(story: StoryCreate) {
    const selectedProject = this.projectService.entityDetail();
    const selectedWorkflow = this.workflowService.entityDetail();
    if (selectedProject && selectedWorkflow) {
      await this.storyService.createRequest(story, {
        projectId: selectedProject.id,
        workflowSlug: selectedWorkflow.slug,
      });
    }
  }

  async assignStory(username: string, projectId: string, storyRef: number) {
    await this.storyService.createAssign(projectId, storyRef, username);
  }

  async removeAssignStory(username: string, projectId: string, storyRef: number) {
    await this.storyService.deleteAssign(projectId, storyRef, username);
  }

  async editSelectedWorkflow(
    patchData: Partial<Omit<Workflow, "projectId" | "slug">>,
    params: { projectId: string; workflowSlug: string },
  ) {
    const updatedWorkflow = await this.workflowService.patchRequest(patchData, params);
    if (updatedWorkflow) {
      this.projectService.editWorkflow(updatedWorkflow);
    }
    return updatedWorkflow;
  }

  async deletesSelectedWorkflow(moveToWorkflow: Workflow["slug"] | undefined): Promise<
    | {
        deletedWorkflow: Workflow | undefined;
        redirectionSlug: Workflow["slug"];
      }
    | undefined
  > {
    const workflowToDelete = this.workflowService.entityDetail();
    const selectedProject = this.projectService.entityDetail();
    const selectedWorkflow = this.workflowService.entityDetail();
    if (!selectedProject || !workflowToDelete || !selectedWorkflow) {
      return undefined;
    }
    const deletedWorkflow = await this.workflowService.deleteRequest(
      workflowToDelete,
      { workflowSlug: workflowToDelete.slug, projectId: workflowToDelete.projectId },
      moveToWorkflow ? { moveToWorkflow: moveToWorkflow } : undefined,
    );
    if (!deletedWorkflow) {
      return undefined;
    }
    await this.projectService.getRequest({ projectId: selectedProject.id });
    let redirectionSlug = moveToWorkflow;
    if (!moveToWorkflow) {
      const workflowsExceptSelected = (project: ProjectDetail, selectedWorkflowSlug: Workflow["slug"]) => {
        return project.workflows.filter((workflow) => workflow.slug !== selectedWorkflowSlug)[0];
      };
      redirectionSlug = workflowsExceptSelected(selectedProject, selectedWorkflow.slug).slug || undefined;
    }

    return redirectionSlug
      ? {
          deletedWorkflow: deletedWorkflow,
          redirectionSlug: redirectionSlug,
        }
      : undefined;
  }
}
