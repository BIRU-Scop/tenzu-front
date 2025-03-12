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

import { inject, Injectable } from "@angular/core";
import { WorkspaceApiService } from "./workspace-api.service";
import { WorkspaceDetailStore, WorkspaceEntitiesSummaryStore } from "./workspace-entities-summary.store";
import { WsService } from "@tenzu/utils/services/ws";
import { Workspace } from "./workspace.model";
import { BaseRepositoryService } from "../base";
import type * as WorkspaceApiServiceType from "./workspace-api.type";
import { QueryParams } from "../base/utils";

@Injectable({
  providedIn: "root",
})
export class WorkspaceRepositoryService extends BaseRepositoryService<
  Workspace,
  Workspace,
  WorkspaceApiServiceType.ListEntitiesSummaryParams,
  WorkspaceApiServiceType.CreateEntityDetailParams,
  WorkspaceApiServiceType.GetEntityDetailParams,
  WorkspaceApiServiceType.PutEntityDetailParams,
  WorkspaceApiServiceType.PatchEntityDetailParams,
  WorkspaceApiServiceType.DeleteEntityDetailParams
> {
  private wsService = inject(WsService);
  protected apiService = inject(WorkspaceApiService);
  protected entitiesSummaryStore = inject(WorkspaceEntitiesSummaryStore);
  protected entityDetailStore = inject(WorkspaceDetailStore);

  override async deleteRequest(
    item: Workspace,
    params: WorkspaceApiServiceType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<Workspace> {
    const workspace = await super.deleteRequest(item, params, queryParams);
    this.wsService.command({ command: "unsubscribe_to_workspace_events", workspace: workspace.id });
    return workspace;
  }
}
