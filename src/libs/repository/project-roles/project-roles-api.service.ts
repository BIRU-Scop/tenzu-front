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
import { ProjectRoleDetail, ProjectRoleSummary } from "./project-roles.model";
import { AbstractApiService } from "../base";
import type * as ProjectRolesApiServiceType from "./project-roles-api.type";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProjectRolesApiService extends AbstractApiService<
  ProjectRoleSummary,
  ProjectRoleDetail,
  ProjectRolesApiServiceType.ListEntitiesSummaryParams,
  ProjectRolesApiServiceType.GetEntityDetailParams,
  ProjectRolesApiServiceType.CreateEntityDetailParams,
  ProjectRolesApiServiceType.PutEntityDetailParams,
  ProjectRolesApiServiceType.PatchEntityDetailParams,
  ProjectRolesApiServiceType.DeleteEntityDetailParams
> {
  override baseUrl = `${this.configAppService.apiUrl()}/projects`;

  protected override getBaseUrl(params: ProjectRolesApiServiceType.BaseParams): string {
    return `${this.baseUrl}/${params.projectId}/roles`;
  }
  protected override getEntityBaseUrl(params: ProjectRolesApiServiceType.GetEntityDetailParams): string {
    return `${this.baseUrl}/roles/${params.roleId}`;
  }

  override delete(
    params: ProjectRolesApiServiceType.DeleteEntityDetailParams,
    queryParams?: { moveTo: ProjectRoleDetail["id"] },
  ): Observable<void | ProjectRoleDetail> {
    return super.delete(params, queryParams);
  }
}
