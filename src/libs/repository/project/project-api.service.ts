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
  ProjectApiServiceType.DeleteEntityDetailParams,
  CreateProjectPayload
> {
  baseUrl = `${this.configAppService.apiUrl()}/projects`;
  protected override getBaseUrl(params: ProjectApiServiceType.ListEntitiesSummaryParams) {
    return `${this.configAppService.apiUrl()}/workspaces/${params.workspaceId}/projects`;
  }

  protected override getEntityBaseUrl(params: ProjectApiServiceType.BaseParams) {
    return `${this.baseUrl}/${params.projectId}`;
  }

  override create(
    item: CreateProjectPayload,
    params: ProjectApiServiceType.CreateEntityDetailParams,
    options = { dataIsFormData: true },
  ): Observable<ProjectDetail> {
    return super.create(item, params, {}, options);
  }

  override patch(): Observable<ProjectDetail> {
    throw new Error("Method not implemented.");
  }

  patchWithLogo(
    item: UpdateProjectPayload,
    params: ProjectApiServiceType.PatchEntityDetailParams,
  ): Observable<ProjectDetail> {
    const data = makeFormData<Partial<UpdateProjectPayload>>(item);
    return this.http
      .patch<BaseDataModel<ProjectDetail>>(this.patchUrl(params), data)
      .pipe(map((dataObject) => dataObject.data));
  }
}
