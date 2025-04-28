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

import { computed, inject, Injectable } from "@angular/core";
import * as ProjectApiServiceType from "./project-api.type";
import { ProjectApiService } from "./project-api.service";
import { ProjectDetailStore, ProjectEntitiesSummaryStore } from "./project-entities.store";
import { Workflow } from "../workflow";
import { ProjectDetail, ProjectSummary } from "./project.model";
import { BaseRepositoryService } from "../base";

import { QueryParams } from "../base/utils";
import { WsService } from "@tenzu/utils/services/ws";
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

  canCreateWorkflow = computed(() => {
    const selectedProject = this.entityDetail();
    if (!selectedProject) return false;
    const selectedProjectWorkflows = selectedProject.workflows;
    return selectedProjectWorkflows.length < MAX_WORKFLOWS;
  });

  override async deleteRequest(
    item: ProjectDetail,
    params: ProjectApiServiceType.BaseParams,
    queryParams?: QueryParams,
  ) {
    const result = super.deleteRequest(item, params, queryParams);
    this.wsService.command({
      command: "unsubscribe_from_project_events",
      project: item.id as string,
    });
    return result;
  }

  override async getRequest(params: ProjectApiServiceType.GetEntityDetailParams, queryParams?: QueryParams) {
    const currentEntityDetail = this.entityDetail()?.id as string;
    if (currentEntityDetail) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: currentEntityDetail });
    }
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
}
