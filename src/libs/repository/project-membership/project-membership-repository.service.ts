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

@Injectable({
  providedIn: "root",
})
export class ProjectMembershipRepositoryService {
  private projectMembershipApiService = inject(ProjectMembershipApiService);
  private projectMembershipStore = inject(ProjectMembershipEntitiesStore);
  entities = this.projectMembershipStore.entities;
  entityMap = this.projectMembershipStore.entityMap;

  async listProjectMembership(projectId: string) {
    const projectMemberships = await lastValueFrom(this.projectMembershipApiService.list({ projectId }));
    this.projectMembershipStore.setAllEntities(projectMemberships);
  }

  async patchProjectMembership(projectId: string, username: string, value: Partial<ProjectMembership>) {
    const projectMembership = await lastValueFrom(
      this.projectMembershipApiService.patch(value, { projectId, username }),
    );
    this.projectMembershipStore.updateEntity(projectMembership.user.username, projectMembership);
  }

  async deleteProjectMembership(projectId: string, username: string) {
    await lastValueFrom(this.projectMembershipApiService.delete({ projectId, username }));
    this.projectMembershipStore.deleteEntity(username);
  }
}
