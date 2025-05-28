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
import { Observable } from "rxjs";
import { AbstractApiService } from "../base";
import { CreateProjectPayload, ProjectDetail, ProjectSummary, UpdateProjectPayload } from "./project.model";
import type * as ProjectApiServiceTypes from "./project-api.type";

@Injectable({
  providedIn: "root",
})
export class ProjectApiService extends AbstractApiService<
  ProjectSummary,
  ProjectDetail,
  ProjectApiServiceTypes.ListEntitiesSummaryParams,
  ProjectApiServiceTypes.GetEntityDetailParams,
  ProjectApiServiceTypes.CreateEntityDetailParams,
  ProjectApiServiceTypes.PutEntityDetailParams,
  ProjectApiServiceTypes.PatchEntityDetailParams,
  ProjectApiServiceTypes.DeleteEntityDetailParams
> {
  baseUrl = `${this.configAppService.apiUrl()}projects`;
  protected override getBaseUrl(params: ProjectApiServiceTypes.ListEntitiesSummaryParams) {
    return `${this.configAppService.apiUrl()}workspaces/${params.workspaceId}/projects`;
  }

  protected override getEntityBaseUrl(params: ProjectApiServiceTypes.BaseParams) {
    return `${this.baseUrl}/${params.projectId}`;
  }

  override create(
    newProject: CreateProjectPayload,
    params: ProjectApiServiceTypes.CreateEntityDetailParams,
  ): Observable<ProjectDetail> {
    return super.create(newProject, params, undefined, { dataIsFormData: true });
  }

  override patch(
    item: UpdateProjectPayload,
    params: ProjectApiServiceTypes.PatchEntityDetailParams,
  ): Observable<ProjectDetail> {
    return super.patch(item, params, undefined, { dataIsFormData: true });
  }
}
