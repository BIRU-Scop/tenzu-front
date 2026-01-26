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
import { Observable } from "rxjs";
import { AbstractApiService, makeFormData } from "../base";
import { CreateProjectPayload, ProjectDetail, ProjectSummary, UpdateProjectPayload } from "./project.model";
import type * as ProjectApiServiceType from "./project-api.type";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProjectApiService extends AbstractApiService<
  ProjectSummary,
  ProjectDetail,
  ProjectApiServiceType.ListEntitiesSummaryParams,
  ProjectApiServiceType.GetEntityDetailParams,
  ProjectApiServiceType.CreateEntityDetailParams,
  ProjectApiServiceType.PutEntityDetailParams,
  ProjectApiServiceType.PatchEntityDetailParams,
  ProjectApiServiceType.DeleteEntityDetailParams
> {
  baseUrl = `${this.configAppService.apiUrl()}/projects`;
  protected override getBaseUrl(params: ProjectApiServiceType.ListEntitiesSummaryParams) {
    return `${this.configAppService.apiUrl()}/workspaces/${params.workspaceId}/projects`;
  }

  protected override getEntityBaseUrl(params: ProjectApiServiceType.BaseParams) {
    return `${this.baseUrl}/${params.projectId}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override create(item: Partial<ProjectDetail>): Observable<ProjectDetail> {
    throw new Error("Method not implemented.");
  }

  createWithLogo(
    newProject: CreateProjectPayload,
    params: ProjectApiServiceType.CreateEntityDetailParams,
  ): Observable<ProjectDetail> {
    const url = this.createUrl(params);
    const data: FormData | Partial<CreateProjectPayload> = makeFormData<CreateProjectPayload>(newProject);
    return this.http.post<BaseDataModel<ProjectDetail>>(url, data).pipe(map((dataObject) => dataObject.data));
  }

  override patch(
    item: UpdateProjectPayload,
    params: ProjectApiServiceType.PatchEntityDetailParams,
  ): Observable<ProjectDetail> {
    return super.patch(item, params, undefined, { dataIsFormData: true });
  }
}
