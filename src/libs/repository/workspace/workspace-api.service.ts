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
import { WorkspaceDetail, WorkspaceSummary } from "./workspace.model";
import { AbstractApiService } from "../base";
import type * as WorkspaceApiServiceType from "./workspace-api.type";

@Injectable({
  providedIn: "root",
})
export class WorkspaceApiService extends AbstractApiService<
  WorkspaceSummary,
  WorkspaceDetail,
  WorkspaceApiServiceType.ListEntitiesSummaryParams,
  WorkspaceApiServiceType.GetEntityDetailParams,
  WorkspaceApiServiceType.CreateEntityDetailParams,
  WorkspaceApiServiceType.PutEntityDetailParams,
  WorkspaceApiServiceType.PatchEntityDetailParams,
  WorkspaceApiServiceType.DeleteEntityDetailParams
> {
  override baseUrl = `${this.configAppService.apiUrl()}/workspaces`;

  protected override getBaseUrl(): string {
    return this.baseUrl;
  }
  protected override getEntityBaseUrl(params: WorkspaceApiServiceType.BaseParams): string {
    return `${this.baseUrl}/${params.workspaceId}`;
  }
}
