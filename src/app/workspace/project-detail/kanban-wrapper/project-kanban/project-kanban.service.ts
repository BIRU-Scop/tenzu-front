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
import { StorySummary } from "@tenzu/repository/story";
import { StatusSummary } from "@tenzu/repository/status";
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

  public async createStatus(status: Pick<StatusSummary, "name" | "color">) {
    const selectedProject = this.projectService.entityDetail();
    if (selectedProject) {
      await this.workflowService.createStatus(status);
    }
  }

  public async deleteStatus(statusId: string, moveToStatus?: string) {
    await this.workflowService.deleteStatus({ statusId, moveToStatus });
    const newStatus = this.workflowService.entityDetail()?.statuses.find((status) => status.id === moveToStatus);
    if (newStatus) {
      this.storyService.deleteStatusGroup(statusId, newStatus);
    }
  }

  public async editStatus(status: Pick<StatusSummary, "name" | "id">) {
    await this.workflowService.editStatus(status);
  }

  public async createStory(story: Pick<StorySummary, "title" | "statusId">) {
    const selectedProject = this.projectService.entityDetail();
    const selectedWorkflow = this.workflowService.entityDetail();
    if (selectedProject && selectedWorkflow) {
      await this.storyService.createRequest(
        { ...story },
        {
          workflowId: selectedWorkflow.id,
        },
      );
    }
  }

  async editSelectedWorkflow(workflowId: Workflow["id"], patchData: Partial<Omit<Workflow, "projectId" | "slug">>) {
    const updatedWorkflow = await this.workflowService.patchRequest(workflowId, patchData, { workflowId });
    if (updatedWorkflow) {
      this.projectService.editWorkflow(updatedWorkflow);
    }
    return updatedWorkflow;
  }
  private moveToWorkflowOrFirstUnselectedWorkflow = (
    moveToWorkflowId: Workflow["id"] | undefined,
    project: ProjectDetail,
    selectedWorkflowId: Workflow["id"],
  ) => {
    if (moveToWorkflowId) {
      return project.workflows.find((workflow) => workflow.id === moveToWorkflowId);
    }
    const firstWorkflow = project.workflows.filter((workflow) => workflow.id !== selectedWorkflowId);
    return firstWorkflow.length > 0 ? firstWorkflow[0] : undefined;
  };

  async deletesSelectedWorkflow(moveToWorkflowId: Workflow["id"] | undefined): Promise<
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
      { workflowId: workflowToDelete.id },
      moveToWorkflowId ? { moveTo: moveToWorkflowId } : undefined,
    );
    if (!deletedWorkflow) {
      return undefined;
    }
    await this.projectService.getRequest({ projectId: selectedProject.id });
    const redirectionSlug = this.moveToWorkflowOrFirstUnselectedWorkflow(
      moveToWorkflowId,
      selectedProject,
      selectedWorkflow.id,
    )?.slug;

    return redirectionSlug
      ? {
          deletedWorkflow: deletedWorkflow,
          redirectionSlug: redirectionSlug,
        }
      : undefined;
  }
}
