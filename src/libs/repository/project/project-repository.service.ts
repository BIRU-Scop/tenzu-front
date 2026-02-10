/*
 * Copyright (C) 2024-2026 BIRU
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

import { computed, inject, Injectable } from "@angular/core";
import * as ProjectApiServiceType from "./project-api.type";
import { ProjectApiService } from "./project-api.service";
import { ProjectDetailStore, ProjectEntitiesSummaryStore } from "./project-entities.store";
import { Workflow } from "../workflow";
import { ProjectDetail, ProjectSummary } from "./project.model";
import { BaseRepositoryService } from "../base";

import { QueryParams } from "../base/utils";
import { WsService } from "@tenzu/utils/services/ws";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { StoryRepositoryService } from "@tenzu/repository/story";
// todo temporary way to handle workflows maximum before implementing user settings
const MAX_WORKFLOWS = 8;

@Injectable({
  providedIn: "root",
})
export class ProjectRepositoryService extends BaseRepositoryService<
  ProjectSummary,
  ProjectDetail,
  ProjectApiServiceType.ListEntitiesSummaryParams,
  ProjectApiServiceType.GetEntityDetailParams,
  ProjectApiServiceType.CreateEntityDetailParams,
  ProjectApiServiceType.PutEntityDetailParams,
  ProjectApiServiceType.PatchEntityDetailParams,
  ProjectApiServiceType.DeleteEntityDetailParams
> {
  protected apiService = inject(ProjectApiService);
  protected entitiesSummaryStore = inject(ProjectEntitiesSummaryStore);
  protected entityDetailStore = inject(ProjectDetailStore);
  protected wsService = inject(WsService);
  protected projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  protected projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  protected storyRepositoryService = inject(StoryRepositoryService);

  canCreateWorkflow = computed(() => {
    const selectedProject = this.entityDetail();
    if (!selectedProject) return false;
    const selectedProjectWorkflows = selectedProject.workflows;
    return selectedProjectWorkflows.length < MAX_WORKFLOWS;
  });

  override async createRequest(
    item: Partial<ProjectDetail>,
    params: ProjectApiServiceType.CreateEntityDetailParams,
    options: { prepend: boolean } = { prepend: false },
  ) {
    this.resetEntityDetail();
    const result = await super.createRequest(item, params, options);
    this.projectMembershipRepositoryService.listProjectMembershipRequest(result.id).then();
    this.projectRoleRepositoryService.listRequest({ projectId: result.id }).then();
    return result;
  }

  override async deleteRequest(
    item: ProjectDetail,
    params: ProjectApiServiceType.BaseParams,
    queryParams?: QueryParams,
  ) {
    this.unsubscribeFromPrevious();
    const result = await super.deleteRequest(item, params, queryParams);
    return result;
  }

  override async getRequest(params: ProjectApiServiceType.GetEntityDetailParams, queryParams?: QueryParams) {
    const item = await super.getRequest(params, queryParams);
    this.wsService.command({ command: "subscribe_to_project_events", project: params.projectId });
    return item;
  }

  addWorkflow(workflow: Workflow) {
    this.entityDetailStore.addWorkflow(workflow);
  }
  editWorkflow(workflow: Workflow) {
    this.entityDetailStore.editWorkflow(workflow);
  }

  removeWorkflow(workflow: Workflow) {
    this.entityDetailStore.deleteWorkflow(workflow);
  }
  override resetEntityDetail() {
    this.unsubscribeFromPrevious();
    super.resetEntityDetail();
    this.storyRepositoryService.resetAll();
    this.projectMembershipRepositoryService.resetAll();
    this.projectRoleRepositoryService.resetAll();
  }

  unsubscribeFromPrevious() {
    const currentEntityDetail = this.entityDetail();
    if (currentEntityDetail) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: currentEntityDetail.id });
    }
  }

  setup({ projectId }: { projectId: ProjectSummary["id"] }) {
    const oldProjectDetail = this.entityDetail();
    if (oldProjectDetail?.id != projectId) {
      this.resetEntityDetail();
      return Promise.all([
        this.getRequest({ projectId }),
        this.projectMembershipRepositoryService.listProjectMembershipRequest(projectId),
        this.projectRoleRepositoryService.listRequest({ projectId }),
      ]);
    }
    return undefined;
  }
}
