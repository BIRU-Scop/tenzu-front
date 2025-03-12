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
import { ProjectDetail } from "../project";
import { Workspace } from "../workspace";
import { CreateWorkspaceInvitation } from "./workspace-invitation.model";

@Injectable({
  providedIn: "root",
})
export class WorkspaceInvitationRepositoryService {
  private workspaceInvitationsApiService = inject(WorkspaceInvitationsApiService);
  private workspaceInvitationEntitiesStore = inject(WorkspaceInvitationEntitiesStore);
  entities = this.workspaceInvitationEntitiesStore.entities;
  entityMap = this.workspaceInvitationEntitiesStore.entityMap;

  async listWorkspaceInvitations(workspaceId: Workspace["id"]) {
    const workspaceInvitations = await lastValueFrom(this.workspaceInvitationsApiService.list({ workspaceId }));
    this.workspaceInvitationEntitiesStore.setAllEntities(workspaceInvitations);
  }

  async createBulkInvitations(workspaceId: ProjectDetail["id"], invitations: CreateWorkspaceInvitation[]) {
    const createWorkspaceInvitationResponse = await lastValueFrom(
      this.workspaceInvitationsApiService.createBulkInvitations({ invitations }, { workspaceId }),
    );
    this.workspaceInvitationEntitiesStore.addEntities(createWorkspaceInvitationResponse.invitations);
  }
}
