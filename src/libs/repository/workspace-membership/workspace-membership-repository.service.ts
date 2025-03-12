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
import { WorkspaceMembershipApiService } from "./workspace-membership-api-service";
import { WorkspaceMembership } from "./workspace-membership.model";
import { WorkspaceMembershipEntitiesStore } from "@tenzu/repository/workspace-membership/workspace-membership.store";

@Injectable({
  providedIn: "root",
})
export class WorkspaceMembershipRepositoryService {
  private workspaceMembershipApiService = inject(WorkspaceMembershipApiService);
  private workspaceMembershipStore = inject(WorkspaceMembershipEntitiesStore);
  entities = this.workspaceMembershipStore.entities;
  entityMap = this.workspaceMembershipStore.entityMap;

  async listWorkspaceMembership(workspaceId: string) {
    const projectMemberships = await lastValueFrom(this.workspaceMembershipApiService.list({ workspaceId }));
    this.workspaceMembershipStore.setAllEntities(projectMemberships);
  }

  async patchWorkspaceMembership(workspaceId: string, username: string, value: Partial<WorkspaceMembership>) {
    const projectMembership = await lastValueFrom(
      this.workspaceMembershipApiService.patch(value, { workspaceId, username }),
    );
    this.workspaceMembershipStore.updateEntity(projectMembership.user.username, projectMembership);
  }

  async deleteWorkspaceMembership(workspaceId: string, username: string) {
    await lastValueFrom(this.workspaceMembershipApiService.delete({ workspaceId, username }));
    this.workspaceMembershipStore.deleteEntity(username);
  }
}
