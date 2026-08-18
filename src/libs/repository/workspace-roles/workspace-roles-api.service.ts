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
import { WorkspaceRole, workspaceRoleSchema } from "./workspace-roles.model";
import { AbstractApiService } from "../base/abstract-api-services";
import type * as WorkspaceRolesApiServiceType from "./workspace-roles-api.type";

@Injectable({
  providedIn: "root",
})
export class WorkspaceRolesApiService extends AbstractApiService<
  WorkspaceRole,
  WorkspaceRole,
  WorkspaceRolesApiServiceType.ListEntitiesSummaryParams,
  WorkspaceRolesApiServiceType.GetEntityDetailParams,
  WorkspaceRolesApiServiceType.CreateEntityDetailParams,
  WorkspaceRolesApiServiceType.PutEntityDetailParams,
  WorkspaceRolesApiServiceType.PatchEntityDetailParams,
  WorkspaceRolesApiServiceType.DeleteEntityDetailParams
> {
  override baseUrl = `${this.configAppService.apiUrl()}/workspaces`;
  protected override summarySchema = workspaceRoleSchema;
  protected override detailSchema = workspaceRoleSchema;

  protected override getBaseUrl(params: WorkspaceRolesApiServiceType.BaseParams): string {
    return `${this.baseUrl}/${params.workspaceId}/roles`;
  }
  protected override getEntityBaseUrl(): string {
    throw new Error("Method not implemented.");
  }
}
