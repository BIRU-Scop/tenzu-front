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
import { WorkflowStore } from "@tenzu/data/workflow/workflow.store";
import { Status, StatusDetail } from "@tenzu/data/status";
import { lastValueFrom } from "rxjs";
import { WorkflowInfraService } from "./workflow-infra.service";
import { ServiceStoreSimpleItem } from "../interface";
import { Workflow } from "./workflow.model";

@Injectable({
  providedIn: "root",
})
export class WorkflowService implements ServiceStoreSimpleItem<Workflow> {
  private workflowStore = inject(WorkflowStore);
  private workflowInfraService = inject(WorkflowInfraService);
  selectedEntity = this.workflowStore.item;
  statuses = this.workflowStore.entities;
  deleteSelected(): Promise<Workflow | undefined> {
    throw new Error("Method not implemented.");
  }

  async create(item: Pick<Workflow, "projectId" | "name">): Promise<Workflow> {
    return await lastValueFrom(this.workflowInfraService.create(item));
  }

  async get(projectId: string, workflowId: string): Promise<Workflow | undefined> {
    let workflow = this.selectedEntity();
    if (workflow && workflow.id === workflowId && workflow.projectId === projectId) {
      return workflow;
    } else {
      this.resetSelectedEntity();
    }
    workflow = await lastValueFrom(this.workflowInfraService.getById(projectId, workflowId));

    if (workflow) {
      this.workflowStore.setWorkflow(workflow);
      return workflow;
    }
    return undefined;
  }
  async getBySlug(workflow: Pick<Workflow, "projectId" | "slug">): Promise<Workflow | undefined> {
    const refreshedWorkflow = await lastValueFrom(this.workflowInfraService.get(workflow.projectId, workflow.slug));
    if (refreshedWorkflow) {
      this.workflowStore.setWorkflow(refreshedWorkflow);
      return refreshedWorkflow;
    }
    return undefined;
  }
  updateSelected(): Promise<Workflow | undefined> {
    throw new Error("Method not implemented.");
  }
  resetSelectedEntity(): void {
    this.workflowStore.reset();
  }

  async createStatus(projectId: string, status: Pick<Status, "name" | "color">) {
    const selectedWorkflow = this.workflowStore.item();
    if (selectedWorkflow) {
      const newStatus = await lastValueFrom(
        this.workflowInfraService.createStatus(projectId, selectedWorkflow.slug, status),
      );
      this.workflowStore.addStatus(newStatus);
      return newStatus;
    }
    return undefined;
  }
  async editStatus(projectId: string, status: Pick<Status, "name" | "id">) {
    const selectedWorkflow = this.workflowStore.item();
    if (selectedWorkflow) {
      const editedStatus = await lastValueFrom(
        this.workflowInfraService.editStatus(projectId, selectedWorkflow.slug, status),
      );
      this.workflowStore.updateStatus(editedStatus);
      return editedStatus;
    }
    return undefined;
  }
  async deleteStatus(projectId: string, statusId: string, moveToStatus: string | undefined) {
    const selectedWorkflow = this.workflowStore.item();
    if (selectedWorkflow) {
      await lastValueFrom(
        this.workflowInfraService.deleteStatus(projectId, selectedWorkflow.slug, statusId, moveToStatus),
      );
      this.workflowStore.removeStatus(statusId);
      return statusId;
    }
    return undefined;
  }
  async reorder(projectId: string, workflowId: string, oldPosition: number, newPosition: number) {
    const payload = this.workflowStore.reorder(oldPosition, newPosition);
    await lastValueFrom(this.workflowInfraService.reorderStatus(projectId, workflowId, payload));
  }
  wsAddStatus(status: StatusDetail) {
    this.workflowStore.addStatus(status);
  }
  wsUpdateStatus(status: StatusDetail) {
    this.workflowStore.updateStatus(status);
  }
  wsRemoveStatus(statusId: string) {
    this.workflowStore.removeStatus(statusId);
  }
}
