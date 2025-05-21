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
import { ProjectDetail } from "../project";
import { InvitationsPayload } from "../membership";
import { map } from "rxjs/operators";
import { ProjectInvitation } from "./project-invitation.model";
import { WorkspaceRepositoryService, WorkspaceSummary } from "@tenzu/repository/workspace";
import { ArrayElement } from "@tenzu/utils/functions/typing";

@Injectable({
  providedIn: "root",
})
export class ProjectInvitationRepositoryService {
  private projectInvitationsApiService = inject(ProjectInvitationsApiService);
  private projectInvitationEntitiesStore = inject(ProjectInvitationsEntitiesSummaryStore);
  entities = this.projectInvitationEntitiesStore.entities;
  entityMap = this.projectInvitationEntitiesStore.entityMap;
  private workspaceService = inject(WorkspaceRepositoryService);

  async listProjectInvitations(projectId: ProjectDetail["id"]) {
    const projectInvitations = await lastValueFrom(this.projectInvitationsApiService.list({ projectId }));
    this.projectInvitationEntitiesStore.setAllEntities(projectInvitations);
  }

  async resendProjectInvitation(invitationId: ProjectInvitation["id"]) {
    const projectInvitations = await lastValueFrom(this.projectInvitationsApiService.resend({ invitationId }));
    this.projectInvitationEntitiesStore.updateEntity(invitationId, projectInvitations);
  }

  async acceptProjectInvitation(params: { project: ArrayElement<WorkspaceSummary["userInvitedProjects"]> }) {
    const workspace = { ...this.workspaceService.entityMapSummary()[params.project.workspaceId] } as WorkspaceSummary;
    const updatedInvitation = await this.acceptInvitationForCurrentUser(params.project.id);
    if (updatedInvitation) {
      workspace.userInvitedProjects = workspace.userInvitedProjects.filter(
        (invitedProject: ArrayElement<WorkspaceSummary["userInvitedProjects"]>) =>
          invitedProject.id !== updatedInvitation.project.id,
      );
      workspace.userMemberProjects = [...workspace.userMemberProjects, { ...params.project }];
      this.workspaceService.updateEntitySummary(workspace.id, workspace);
    }
  }

  async denyProjectInvitation(params: { project: ArrayElement<WorkspaceSummary["userInvitedProjects"]> }) {
    const workspace = { ...this.workspaceService.entityMapSummary()[params.project.workspaceId] } as WorkspaceSummary;
    const updatedInvitation = await this.denyInvitationForCurrentUser(params.project.id);
    if (updatedInvitation) {
      workspace.userInvitedProjects = workspace.userInvitedProjects.filter(
        (invitedProject: ArrayElement<WorkspaceSummary["userInvitedProjects"]>) =>
          invitedProject.id !== params.project.id,
      );
      this.workspaceService.updateEntitySummary(workspace.id, workspace);
    }
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
    this.projectInvitationEntitiesStore.addEntities(createProjectInvitationResponse.invitations);
  }
  async denyInvitationForCurrentUser(projectId: ProjectDetail["id"]) {
    return await lastValueFrom(this.projectInvitationsApiService.denyForCurrentUser({ projectId }));
  }

  async acceptInvitationForCurrentUser(projectId: ProjectDetail["id"]) {
    return await lastValueFrom(this.projectInvitationsApiService.acceptForCurrentUser({ projectId }));
  }
}
