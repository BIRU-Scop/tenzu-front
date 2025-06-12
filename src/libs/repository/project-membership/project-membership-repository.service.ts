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
import { ProjectMembership } from "./project-membership.model";
import { ProjectMembershipApiService } from "./project-membership-api.service";
import { lastValueFrom } from "rxjs";
import { ProjectMembershipEntitiesStore } from "./project-membership-entities.store";
import { NotFoundEntityError } from "../base/errors";
import { UserNested } from "@tenzu/repository/user";
import { ResetService } from "@tenzu/repository/base/reset.service";

@Injectable({
  providedIn: "root",
})
export class ProjectMembershipRepositoryService {
  private projectMembershipApiService = inject(ProjectMembershipApiService);
  private projectMembershipStore = inject(ProjectMembershipEntitiesStore);
  entities = this.projectMembershipStore.entities;
  entityMap = this.projectMembershipStore.entityMap;
  memberMap = this.projectMembershipStore.memberMap;
  members = this.projectMembershipStore.members;
  readonly resetService = inject(ResetService);

  constructor() {
    this.resetService.register(this);
  }

  async listProjectMembershipRequest(projectId: string) {
    const projectMemberships = await lastValueFrom(this.projectMembershipApiService.list({ projectId }));
    this.projectMembershipStore.setAllEntities(projectMemberships);
  }

  async patchRequest(
    membershipId: ProjectMembership["id"],
    partialData: Pick<ProjectMembership, "roleId">,
  ): Promise<ProjectMembership> {
    if (this.entityMap()[membershipId]) {
      const entity = await lastValueFrom(this.projectMembershipApiService.patch(partialData, { membershipId }));
      return this.projectMembershipStore.updateEntity(membershipId, entity);
    }
    throw new NotFoundEntityError(`Entity ${membershipId} not found`);
  }

  async deleteRequest(membershipId: ProjectMembership["id"], successorId?: UserNested["id"]) {
    await lastValueFrom(
      this.projectMembershipApiService.delete(
        { membershipId },
        successorId ? { successorUserId: successorId } : undefined,
      ),
    );
    this.projectMembershipStore.deleteEntity(membershipId);
  }

  resetEntitySummaryList(): void {
    this.projectMembershipStore.reset();
  }
  resetAll(): void {
    this.resetEntitySummaryList();
  }
}
