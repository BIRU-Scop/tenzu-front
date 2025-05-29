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
import { ProjectInvitationsEntitiesSummaryStore } from "./project-invitations-entities.store";
import { ProjectInvitationsApiService } from "./project-invitation-api.service";
import { ProjectDetail, ProjectNested } from "../project";
import { InvitationsPayload } from "../membership";
import { map } from "rxjs/operators";
import { ProjectInvitation } from "./project-invitation.model";
import { WorkspaceRepositoryService, WorkspaceSummary } from "@tenzu/repository/workspace";
import { EntityId, SelectEntityId } from "@ngrx/signals/entities";
import { getEntityIdSelector } from "@tenzu/repository/base";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";

@Injectable({
  providedIn: "root",
})
export class ProjectInvitationRepositoryService {
  private projectInvitationsApiService = inject(ProjectInvitationsApiService);
  private projectInvitationEntitiesStore = inject(ProjectInvitationsEntitiesSummaryStore);
  entities = this.projectInvitationEntitiesStore.entities;
  entityMap = this.projectInvitationEntitiesStore.entityMap;
  private workspaceService = inject(WorkspaceRepositoryService);

  protected selectIdFn: SelectEntityId<NoInfer<ProjectInvitation>> | undefined = undefined;
  protected getEntityIdFn = getEntityIdSelector({ selectId: this.selectIdFn });

  updateEntitySummary(id: EntityId, partialItem: Partial<ProjectInvitation>): ProjectInvitation {
    return this.projectInvitationEntitiesStore.updateEntity(id, partialItem);
  }

  async patchRequest(
    item: Pick<ProjectInvitation, "roleId">,
    params: { invitationId: ProjectInvitation["id"] },
  ): Promise<ProjectInvitation> {
    if (!this.entityMap()[this.getEntityIdFn(item)]) {
      const entity = await lastValueFrom(this.projectInvitationsApiService.patch(item, params));
      this.updateEntitySummary(this.getEntityIdFn(item), entity);
    }
    throw new NotFoundEntityError(`Entity ${this.getEntityIdFn(item)} not found`, item);
  }

  async listProjectInvitations(projectId: ProjectDetail["id"]) {
    const projectInvitations = await lastValueFrom(this.projectInvitationsApiService.list({ projectId }));
    this.projectInvitationEntitiesStore.setAllEntities(projectInvitations);
  }

  async resendProjectInvitation(invitationId: ProjectInvitation["id"]) {
    const projectInvitations = await lastValueFrom(this.projectInvitationsApiService.resend({ invitationId }));
    this.projectInvitationEntitiesStore.updateEntity(invitationId, projectInvitations);
  }

  async acceptProjectInvitation(params: { workspaceId: WorkspaceSummary["id"]; project: ProjectNested }) {
    await this.acceptInvitationForCurrentUser(params.project.id);
    this.workspaceService.removeUserInvitedProjects({ workspaceId: params.workspaceId, projectId: params.project.id });
    this.workspaceService.addUserMemberProjects(params);
  }

  async denyProjectInvitation(params: { workspaceId: WorkspaceSummary["id"]; projectId: ProjectNested["id"] }) {
    await this.denyInvitationForCurrentUser(params.projectId);
    this.workspaceService.removeUserInvitedProjects(params);
  }

  async revokeProjectInvitation(invitationId: ProjectInvitation["id"]) {
    const projectInvitations = await lastValueFrom(this.projectInvitationsApiService.revoke({ invitationId }));
    this.projectInvitationEntitiesStore.updateEntity(invitationId, projectInvitations);
  }

  async createBulkInvitations(project: ProjectDetail, invitations: InvitationsPayload["invitations"]) {
    const createProjectInvitationResponse = await lastValueFrom(
      this.projectInvitationsApiService.createBulkInvitations({ invitations }, { projectId: project.id }).pipe(
        map((createInvitations) => {
          return {
            ...createInvitations,
            invitations: createInvitations.invitations.map((invitation) => ({ ...invitation, project: project })),
          };
        }),
      ),
    );
    this.projectInvitationEntitiesStore.setEntities(createProjectInvitationResponse.invitations);
    this.projectInvitationEntitiesStore.reorder();
  }
  async denyInvitationForCurrentUser(projectId: ProjectDetail["id"]) {
    return await lastValueFrom(this.projectInvitationsApiService.denyForCurrentUser({ projectId }));
  }

  async acceptInvitationForCurrentUser(projectId: ProjectDetail["id"]) {
    return await lastValueFrom(this.projectInvitationsApiService.acceptForCurrentUser({ projectId }));
  }
}
