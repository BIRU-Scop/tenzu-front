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
import { WorkspaceDetail, WorkspaceSummary } from "./workspace.model";
import { BaseRepositoryService } from "../base";
import type * as WorkspaceApiServiceType from "./workspace-api.type";
import { QueryParams } from "../base/utils";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { ProjectNested } from "@tenzu/repository/project";

@Injectable({
  providedIn: "root",
})
export class WorkspaceRepositoryService extends BaseRepositoryService<
  WorkspaceSummary,
  WorkspaceDetail,
  WorkspaceApiServiceType.ListEntitiesSummaryParams,
  WorkspaceApiServiceType.GetEntityDetailParams,
  WorkspaceApiServiceType.CreateEntityDetailParams,
  WorkspaceApiServiceType.PutEntityDetailParams,
  WorkspaceApiServiceType.PatchEntityDetailParams,
  WorkspaceApiServiceType.DeleteEntityDetailParams
> {
  private wsService = inject(WsService);
  protected apiService = inject(WorkspaceApiService);
  protected entitiesSummaryStore = inject(WorkspaceEntitiesSummaryStore);
  protected entityDetailStore = inject(WorkspaceDetailStore);
  private workspaceInvitationService = inject(WorkspaceInvitationRepositoryService);

  removeUserInvitedProjects(params: { workspaceId: WorkspaceSummary["id"]; projectId: ProjectNested["id"] }) {
    this.entitiesSummaryStore.removeUserInvitedProjects(params.workspaceId, params.projectId);
  }
  addUserMemberProjects(params: { workspaceId: WorkspaceSummary["id"]; project: ProjectNested }) {
    this.entitiesSummaryStore.addUserMemberProjects(params.workspaceId, params.project);
  }

  async denyInvitationWorkspace(params: { workspaceId: WorkspaceSummary["id"] }) {
    await this.workspaceInvitationService.denyInvitationForCurrentUser(params.workspaceId);
    this.deleteEntitySummary(params.workspaceId);
  }

  async acceptInvitationWorkspace(params: { workspace: WorkspaceSummary }) {
    await this.workspaceInvitationService.acceptInvitationForCurrentUser(params.workspace.id);
    params.workspace.userIsInvited = false;
    this.updateEntitySummary(params.workspace.id, params.workspace);
  }

  override async deleteRequest(
    item: WorkspaceDetail,
    params: WorkspaceApiServiceType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<WorkspaceDetail> {
    const workspace = await super.deleteRequest(item, params, queryParams);
    this.wsService.command({ command: "unsubscribe_to_workspace_events", workspace: workspace.id });
    return workspace;
  }
}
