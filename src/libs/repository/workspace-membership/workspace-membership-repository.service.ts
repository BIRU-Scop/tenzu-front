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
import { WorkspaceMembershipEntitiesStore } from "./workspace-membership.store";
import { NotFoundEntityError } from "../base/errors";
import { UserNested } from "@tenzu/repository/user";
import { ResetService } from "@tenzu/repository/base/reset.service";
import { WorkspaceSummary } from "@tenzu/repository/workspace";

@Injectable({
  providedIn: "root",
})
export class WorkspaceMembershipRepositoryService {
  private workspaceMembershipApiService = inject(WorkspaceMembershipApiService);
  private workspaceMembershipStore = inject(WorkspaceMembershipEntitiesStore);
  entities = this.workspaceMembershipStore.entities;
  entityMap = this.workspaceMembershipStore.entityMap;
  memberMap = this.workspaceMembershipStore.memberMap;
  members = this.workspaceMembershipStore.members;
  readonly resetService = inject(ResetService);

  constructor() {
    this.resetService.register(this);
  }

  async listWorkspaceMembershipRequest(workspaceId: string) {
    const projectMemberships = await lastValueFrom(this.workspaceMembershipApiService.list({ workspaceId }));
    this.workspaceMembershipStore.setAllEntities(projectMemberships);
  }

  async getDeleteInfoRequest(item: WorkspaceMembership) {
    return await lastValueFrom(this.workspaceMembershipApiService.getDeleteInfo(item));
  }

  addEntitySummary(item: WorkspaceMembership): void {
    this.workspaceMembershipStore.addEntity(item);
  }

  updateEntitySummary(id: WorkspaceMembership["id"], partialItem: Partial<WorkspaceMembership>): WorkspaceMembership {
    return this.workspaceMembershipStore.updateEntity(id, partialItem);
  }

  deleteEntitySummary(id: WorkspaceMembership["id"]): void {
    return this.workspaceMembershipStore.deleteEntity(id);
  }

  async patchRequest(
    membershipId: WorkspaceMembership["id"],
    partialData: Pick<WorkspaceMembership, "roleId">,
  ): Promise<WorkspaceMembership> {
    if (this.entityMap()[membershipId]) {
      const entity = await lastValueFrom(this.workspaceMembershipApiService.patch(partialData, { membershipId }));
      return this.updateEntitySummary(membershipId, entity);
    }
    throw new NotFoundEntityError(`Entity ${membershipId} not found`);
  }

  async deleteRequest(membershipId: WorkspaceMembership["id"], successorId?: UserNested["id"]) {
    await lastValueFrom(
      this.workspaceMembershipApiService.delete(
        { membershipId },
        successorId ? { successorUserId: successorId } : undefined,
      ),
    );
    this.workspaceMembershipStore.deleteEntity(membershipId);
  }

  resetEntitySummaryList(): void {
    this.workspaceMembershipStore.reset();
  }
  resetAll(): void {
    this.resetEntitySummaryList();
  }

  addToProjectCount({ userId, workspaceId }: { userId: UserNested["id"]; workspaceId: WorkspaceSummary["id"] }) {
    const membership = this.workspaceMembershipStore
      .entities()
      .find((membership) => membership.workspaceId === workspaceId && membership.user.id === userId);
    if (membership) {
      this.workspaceMembershipStore.updateEntity(membership.id, {
        ...membership,
        totalProjectsIsMember: membership.totalProjectsIsMember + 1,
      });
    }
  }
}
