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
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";

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
  private workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  private workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  private workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);

  override async createRequest(
    item: Partial<WorkspaceDetail>,
    params: WorkspaceApiServiceType.CreateEntityDetailParams,
    options: { prepend: boolean } = { prepend: false },
  ) {
    this.resetEntityDetail();
    const result = await super.createRequest(item, params, options);
    this.workspaceMembershipRepositoryService.listWorkspaceMembershipRequest(result.id).then();
    this.workspaceRoleRepositoryService.listRequest({ workspaceId: result.id }).then();
    return result;
  }

  removeUserInvitedProjects(params: { workspaceId: WorkspaceSummary["id"]; projectId: ProjectNested["id"] }) {
    this.entitiesSummaryStore.removeUserInvitedProjects(params.workspaceId, params.projectId);
  }
  addUserMemberProjects(params: { workspaceId: WorkspaceSummary["id"]; project: ProjectNested }) {
    this.entitiesSummaryStore.addUserMemberProjects(params.workspaceId, params.project);
  }

  async denyInvitationWorkspace(params: { workspaceId: WorkspaceSummary["id"] }) {
    await this.workspaceInvitationRepositoryService.denyInvitationForCurrentUser(params.workspaceId);
    this.deleteEntitySummary(params.workspaceId);
  }

  async acceptInvitationWorkspace(params: { workspace: WorkspaceSummary }) {
    const workspaceInvitation = await this.workspaceInvitationRepositoryService.acceptInvitationForCurrentUser(
      params.workspace.id,
    );
    params.workspace.userIsInvited = false;
    params.workspace.userIsMember = true;
    const userRole = this.workspaceRoleRepositoryService.entityMapSummary()[workspaceInvitation.roleId];
    if (userRole) {
      params.workspace.userCanCreateProjects = userRole.permissions.includes(WorkspacePermissions.CREATE_PROJECT);
    }
    this.updateEntitySummary(params.workspace.id, params.workspace);
  }

  override async deleteRequest(
    item: WorkspaceDetail,
    params: WorkspaceApiServiceType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<WorkspaceDetail> {
    this.unsubscribeFromPrevious();
    const result = await super.deleteRequest(item, params, queryParams);
    return result;
  }

  override async getRequest(params: WorkspaceApiServiceType.GetEntityDetailParams, queryParams?: QueryParams) {
    this.unsubscribeFromPrevious();
    const item = await super.getRequest(params, queryParams);
    this.wsService.command({ command: "subscribe_to_workspace_events", workspace: params.workspaceId });
    return item;
  }
  override resetEntityDetail() {
    this.unsubscribeFromPrevious();
    super.resetEntityDetail();
    this.workspaceMembershipRepositoryService.resetAll();
    this.workspaceRoleRepositoryService.resetAll();
  }

  unsubscribeFromPrevious() {
    const currentEntityDetail = this.entityDetail();
    if (currentEntityDetail) {
      this.wsService.command({ command: "unsubscribe_from_workspace_events", workspace: currentEntityDetail.id });
    }
  }

  setup({ workspaceId }: { workspaceId: WorkspaceSummary["id"] }) {
    const oldWorkspaceDetail = this.entityDetail();
    if (oldWorkspaceDetail?.id != workspaceId) {
      this.resetEntityDetail();

      const promise = this.getRequest({ workspaceId }).then();
      this.workspaceMembershipRepositoryService.listWorkspaceMembershipRequest(workspaceId).then();
      this.workspaceRoleRepositoryService.listRequest({ workspaceId }).then();
      return promise;
    }
    return undefined;
  }
}
