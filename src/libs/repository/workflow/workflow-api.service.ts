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

import { Injectable } from "@angular/core";
import { Workflow, ReorderWorkflowStatusesPayload } from "./workflow.model";
import { Status } from "../status";
import { AbstractApiServiceDetail } from "../base";
import type * as WorkflowApiServiceType from "./workflow-api.type";

@Injectable({
  providedIn: "root",
})
export class WorkflowApiService extends AbstractApiServiceDetail<
  Workflow,
  WorkflowApiServiceType.GetEntityDetailParams,
  WorkflowApiServiceType.CreateEntityDetailParams,
  WorkflowApiServiceType.PutEntityDetailParams,
  WorkflowApiServiceType.PatchEntityDetailParams,
  WorkflowApiServiceType.DeleteEntityDetailParams
> {
  override baseUrl = `${this.configAppService.apiUrl()}projects`;
  url = `${this.configAppService.apiUrl()}`;

  protected override getBaseUrl(params: { projectId: Workflow["projectId"] }) {
    return `${this.baseUrl}/${params.projectId}/workflows`;
  }

  protected override getEntityBaseUrl(params: WorkflowApiServiceType.BaseParams) {
    return `${this.getBaseUrl(params)}/${params.workflowSlug}`;
  }

  override create(item: Pick<Workflow, "name">, params: { projectId: Workflow["projectId"] }) {
    return super.create(item, params);
  }

  override patch(
    patchData: Partial<Omit<Workflow, "projectId" | "slug">>,
    params: WorkflowApiServiceType.PatchEntityDetailParams,
  ) {
    return super.patch(patchData, params);
  }

  override delete(
    params: WorkflowApiServiceType.DeleteEntityDetailParams,
    queryParams?: { moveToWorkflow: Workflow["slug"] },
  ) {
    return super.delete(params, queryParams);
  }

  createStatus(projectId: Workflow["projectId"], workflowSlug: Workflow["slug"], newStatus: Pick<Status, "name">) {
    return this.http.post<Status>(`${this.getBaseUrl({ projectId })}/${workflowSlug}/statuses`, newStatus);
  }

  deleteStatus(
    projectId: Workflow["projectId"],
    workflowSlug: Workflow["slug"],
    statusId: string,
    moveToStatus: string | undefined,
  ) {
    return this.http.delete(`${this.getBaseUrl({ projectId })}/${workflowSlug}/statuses/${statusId}`, {
      params: moveToStatus ? { moveTo: moveToStatus } : {},
    });
  }

  editStatus(projectId: Workflow["projectId"], workflowSlug: Workflow["slug"], status: Pick<Status, "name" | "id">) {
    return this.http.patch<Status>(`${this.getBaseUrl({ projectId })}/${workflowSlug}/statuses/${status.id}`, {
      name: status.name,
    });
  }

  getById(params: { projectId: Workflow["projectId"]; workflowId: Workflow["id"] }) {
    return this.http.get<Workflow>(`${this.getBaseUrl(params)}/by_id/${params.workflowId}`);
  }

  reorderStatus(
    projectId: Workflow["projectId"],
    workflowSlug: Workflow["slug"],
    payload: ReorderWorkflowStatusesPayload,
  ) {
    return this.http.post(`${this.getBaseUrl({ projectId })}/${workflowSlug}/statuses/reorder`, payload);
  }
}
