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
import { lastValueFrom } from "rxjs";
import { WorkspaceInvitationEntitiesStore } from "./workspace-invitation.store";
import { WorkspaceInvitationsApiService } from "./workspace-invitation-api-service";
import { WorkspaceDetail, WorkspaceSummary } from "../workspace";
import { InvitationsPayload } from "../membership";
import { map } from "rxjs/operators";
import { WorkspaceInvitation } from "./workspace-invitation.model";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";
import { EntityId, SelectEntityId } from "@ngrx/signals/entities";
import { getEntityIdSelector } from "@tenzu/repository/base";

@Injectable({
  providedIn: "root",
})
export class WorkspaceInvitationRepositoryService {
  private workspaceInvitationsApiService = inject(WorkspaceInvitationsApiService);
  private workspaceInvitationEntitiesStore = inject(WorkspaceInvitationEntitiesStore);
  entities = this.workspaceInvitationEntitiesStore.entities;
  entityMap = this.workspaceInvitationEntitiesStore.entityMap;

  protected selectIdFn: SelectEntityId<NoInfer<WorkspaceInvitation>> | undefined = undefined;
  protected getEntityIdFn = getEntityIdSelector({ selectId: this.selectIdFn });

  updateEntitySummary(id: EntityId, partialItem: Partial<WorkspaceInvitation>): WorkspaceInvitation {
    return this.workspaceInvitationEntitiesStore.updateEntity(id, partialItem);
  }

  async patchRequest(
    item: Pick<WorkspaceInvitation, "roleId">,
    params: { invitationId: WorkspaceInvitation["id"] },
  ): Promise<WorkspaceInvitation> {
    if (!this.entityMap()[this.getEntityIdFn(item)]) {
      const entity = await lastValueFrom(this.workspaceInvitationsApiService.patch(item, params));
      this.updateEntitySummary(this.getEntityIdFn(item), entity);
    }
    throw new NotFoundEntityError(`Entity ${this.getEntityIdFn(item)} not found`, item);
  }

  async listWorkspaceInvitations(workspaceId: WorkspaceSummary["id"]) {
    const workspaceInvitations = await lastValueFrom(this.workspaceInvitationsApiService.list({ workspaceId }));
    this.workspaceInvitationEntitiesStore.setAllEntities(workspaceInvitations);
  }

  async resendWorkspaceInvitation(invitationId: WorkspaceInvitation["id"]) {
    const workspaceInvitations = await lastValueFrom(this.workspaceInvitationsApiService.resend({ invitationId }));
    this.workspaceInvitationEntitiesStore.updateEntity(invitationId, workspaceInvitations);
  }

  async revokeWorkspaceInvitation(invitationId: WorkspaceInvitation["id"]) {
    const workspaceInvitations = await lastValueFrom(this.workspaceInvitationsApiService.revoke({ invitationId }));
    this.workspaceInvitationEntitiesStore.updateEntity(invitationId, workspaceInvitations);
  }
  async denyInvitationForCurrentUser(workspaceId: WorkspaceSummary["id"]) {
    return await lastValueFrom(this.workspaceInvitationsApiService.denyForCurrentUser({ workspaceId }));
  }

  async createBulkInvitations(workspace: WorkspaceDetail, invitations: InvitationsPayload["invitations"]) {
    const createWorkspaceInvitationResponse = await lastValueFrom(
      this.workspaceInvitationsApiService.createBulkInvitations({ invitations }, { workspaceId: workspace.id }).pipe(
        map((createInvitations) => {
          return {
            ...createInvitations,
            invitations: createInvitations.invitations.map((invitation) => ({ ...invitation, workspace: workspace })),
          };
        }),
      ),
    );
    this.workspaceInvitationEntitiesStore.setEntities(createWorkspaceInvitationResponse.invitations);
    this.workspaceInvitationEntitiesStore.reorder();
  }

  async acceptInvitationForCurrentUser(workspaceId: WorkspaceSummary["id"]) {
    return await lastValueFrom(this.workspaceInvitationsApiService.acceptForCurrentUser({ workspaceId }));
  }
}
