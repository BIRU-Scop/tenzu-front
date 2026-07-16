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

import { Injectable } from "@angular/core";
import { Workflow, workflowSchema, ReorderWorkflowStatusesPayload } from "./workflow.model";
import { WorkflowStatusNested, workflowStatusNestedSchema } from "../status/status.model";
import { AbstractApiServiceDetail } from "../base/abstract-api-services";
import { parseWithDebug } from "../base/parse-with-debug";
import type * as WorkflowApiServiceType from "./workflow-api.type";
import { Observable } from "rxjs";
import { BaseDataModel } from "../base/misc.model";
import { map } from "rxjs/operators";

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
  override baseUrl = `${this.configAppService.apiUrl()}/projects`;
  protected override detailSchema = workflowSchema;

  protected override getBaseUrl(params: WorkflowApiServiceType.CreateEntityDetailParams): string {
    return `${this.baseUrl}/${params.projectId}/workflows`;
  }
  protected override createUrl(params: WorkflowApiServiceType.CreateEntityDetailParams): string {
    return super.createUrl(params);
  }

  protected override getEntityBaseUrl(params: WorkflowApiServiceType.BaseParams): string {
    return `${this.configAppService.apiUrl()}/workflows/${params.workflowId}`;
  }
  protected getStatusesBaseUrl(params: WorkflowApiServiceType.BaseParams): string {
    return `${this.getEntityBaseUrl(params)}/statuses`;
  }

  getBySlug(params: { projectId: Workflow["projectId"]; workflowSlug: Workflow["slug"] }): Observable<Workflow> {
    return this.http
      .get<
        BaseDataModel<unknown>
      >(`${this.configAppService.apiUrl()}/projects/${params.projectId}/workflows/by_slug/${params.workflowSlug}`)
      .pipe(map((dataObject) => parseWithDebug(workflowSchema, dataObject.data)));
  }

  createStatus(
    workflowId: Workflow["id"],
    newStatus: Pick<WorkflowStatusNested, "name">,
  ): Observable<WorkflowStatusNested> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.getStatusesBaseUrl({ workflowId })}`, newStatus)
      .pipe(map((dataObject) => parseWithDebug(workflowStatusNestedSchema, dataObject.data)));
  }

  deleteStatus(params: { statusId: string; moveToStatus?: string }): Observable<void> {
    return this.http.delete<void>(`${this.configAppService.apiUrl()}/workflows/statuses/${params.statusId}`, {
      params: params.moveToStatus ? { moveTo: params.moveToStatus } : {},
    });
  }

  editStatus(status: Pick<WorkflowStatusNested, "name" | "id">): Observable<WorkflowStatusNested> {
    return this.http
      .patch<BaseDataModel<unknown>>(`${this.configAppService.apiUrl()}/workflows/statuses/${status.id}`, {
        name: status.name,
      })
      .pipe(map((dataObject) => parseWithDebug(workflowStatusNestedSchema, dataObject.data)));
  }

  reorderStatus(workflowId: Workflow["id"], payload: ReorderWorkflowStatusesPayload): Observable<void> {
    return this.http.post<void>(`${this.getStatusesBaseUrl({ workflowId })}/reorder`, payload);
  }
}
