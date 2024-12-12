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
import { Workflow, WorkflowStatusReorderPayload } from "./workflow.model";
import { HttpClient } from "@angular/common/http";
import { Status } from "@tenzu/data/status";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

@Injectable({
  providedIn: "root",
})
export class WorkflowInfraService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  url = `${this.configAppService.apiUrl()}`;

  getUrl(projectId: string) {
    return `${this.url}projects/${projectId}/workflows`;
  }
  create(item: Pick<Workflow, "projectId" | "name">) {
    return this.http.post<Workflow>(`${this.getUrl(item.projectId)}`, { name: item.name });
  }
  createStatus(projectId: string, workflowSlug: string, newStatus: Pick<Status, "name">) {
    return this.http.post<Status>(`${this.getUrl(projectId)}/${workflowSlug}/statuses`, newStatus);
  }
  deleteStatus(projectId: string, workflowSlug: string, statusId: string, moveToStatus: string | undefined) {
    return this.http.delete(
      `${this.getUrl(projectId)}/${workflowSlug}/statuses/${statusId}${moveToStatus ? `?moveTo=${moveToStatus}` : ""}`,
    );
  }
  editStatus(projectId: string, workflowSlug: string, status: Pick<Status, "name" | "id">) {
    return this.http.patch<Status>(`${this.getUrl(projectId)}/${workflowSlug}/statuses/${status.id}`, {
      name: status.name,
    });
  }

  list(projectId: string) {
    return this.http.get<Workflow[]>(`${this.getUrl(projectId)}`);
  }
  getById(projectId: string, workflowId: string) {
    return this.http.get<Workflow>(`${this.getUrl(projectId)}/by_id/${workflowId}`);
  }
  get(projectId: string, workflowSlug: string) {
    return this.http.get<Workflow>(`${this.getUrl(projectId)}/${workflowSlug}`);
  }
  reorderStatus(projectId: string, workflowSlug: string, payload: WorkflowStatusReorderPayload) {
    return this.http.post(`${this.getUrl(projectId)}/${workflowSlug}/statuses/reorder`, payload);
  }
}
