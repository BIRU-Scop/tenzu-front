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
import { Status, StatusDetail } from "../status";
import { lastValueFrom } from "rxjs";
import { WorkflowApiService } from "./workflow-api.service";
import { Workflow } from "./workflow.model";
import { ProjectRepositoryService } from "../project";
import { WorkflowDetailStore } from "./workflow-entities.store";
import { BaseRepositoryDetailService } from "../base";
import type * as WorkflowApiServiceType from "./workflow-api.type";

@Injectable({
  providedIn: "root",
})
export class WorkflowRepositoryService extends BaseRepositoryDetailService<
  Workflow,
  WorkflowApiServiceType.GetEntityDetailParams,
  WorkflowApiServiceType.CreateEntityDetailParams,
  WorkflowApiServiceType.PutEntityDetailParams,
  WorkflowApiServiceType.PatchEntityDetailParams,
  WorkflowApiServiceType.DeleteEntityDetailParams
> {
  protected entityDetailStore = inject(WorkflowDetailStore);
  protected apiService = inject(WorkflowApiService);
  protected projectRepositoryService = inject(ProjectRepositoryService);

  statuses = this.entityDetailStore.entities;

  override async createRequest(item: Pick<Workflow, "name">, params: WorkflowApiServiceType.CreateEntityDetailParams) {
    const workflow = await super.createRequest(item, params);
    this.projectRepositoryService.addWorkflow(workflow);
    return workflow;
  }

  override async getRequest(params: WorkflowApiServiceType.GetEntityDetailParams) {
    const currentWorkflowDetail = this.entityDetail();

    if (currentWorkflowDetail && currentWorkflowDetail.id === params.workflowId) {
      return currentWorkflowDetail;
    }
    return super.getRequest(params);
  }

  async getBySlugRequest(workflow: Pick<Workflow, "projectId" | "slug">): Promise<Workflow | undefined> {
    const refreshedWorkflow = await lastValueFrom(
      this.apiService.getBySlug({ projectId: workflow.projectId, workflowSlug: workflow.slug }),
    );
    if (refreshedWorkflow) {
      this.entityDetailStore.setWorkflow(refreshedWorkflow);
      return refreshedWorkflow;
    }
    return undefined;
  }

  async createStatus(status: Pick<Status, "name" | "color">) {
    const selectedWorkflow = this.entityDetailStore.item();
    if (selectedWorkflow) {
      const newStatus = await lastValueFrom(this.apiService.createStatus(selectedWorkflow.id, status));
      this.entityDetailStore.addStatus(newStatus);
      return newStatus;
    }
    return undefined;
  }

  async editStatus(status: Pick<Status, "name" | "id">) {
    const editedStatus = await lastValueFrom(this.apiService.editStatus(status));
    this.entityDetailStore.updateStatus(editedStatus);
    return editedStatus;
  }

  async deleteStatus(params: { statusId: string; moveToStatus?: string }) {
    await lastValueFrom(this.apiService.deleteStatus(params));
    this.entityDetailStore.removeStatus(params.statusId);
    return params.statusId;
  }

  async reorder(workflowId: string, oldPosition: number, newPosition: number) {
    const payload = this.entityDetailStore.reorder(oldPosition, newPosition);
    await lastValueFrom(this.apiService.reorderStatus(workflowId, payload));
  }

  wsAddStatus(status: StatusDetail) {
    this.entityDetailStore.addStatus(status);
  }

  wsUpdateStatus(status: StatusDetail) {
    this.entityDetailStore.updateStatus(status);
  }

  wsRemoveStatus(statusId: string) {
    this.entityDetailStore.removeStatus(statusId);
  }
}
