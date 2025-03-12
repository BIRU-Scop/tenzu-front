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
import { ActivatedRoute, Router } from "@angular/router";
import { WorkspaceRepositoryService, Workspace } from "@tenzu/repository/workspace";
import { ArrayElement } from "@tenzu/utils/functions/typing";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";

@Injectable({
  providedIn: "root",
})
export class WorkspaceUtilsService {
  workspaceService = inject(WorkspaceRepositoryService);
  projectInvitationService = inject(ProjectInvitationRepositoryService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  async acceptProjectInvitationForCurrentUser(project: ArrayElement<Workspace["invitedProjects"]>) {
    const workspace = { ...this.workspaceService.entityMapSummary()[project.workspaceId] } as Workspace;
    const acceptedInvitation = await this.projectInvitationService.acceptInvitationForCurrentUser(project.id);
    if (acceptedInvitation) {
      workspace.invitedProjects = workspace.invitedProjects.filter(
        (invitedProject: ArrayElement<Workspace["invitedProjects"]>) =>
          invitedProject.id !== acceptedInvitation.project.id,
      );
      workspace.latestProjects = [...workspace.latestProjects, { ...project }];
      await this.workspaceService.patchRequest(workspace, { workspaceId: workspace.id });
    }
  }

  async denyInvitationForCurrentUser(project: ArrayElement<Workspace["invitedProjects"]>) {
    const workspace = { ...this.workspaceService.entityMapSummary()[project.workspaceId] } as Workspace;
    await this.projectInvitationService.denyInvitationForCurrentUser(project.id);
    workspace.invitedProjects = workspace.invitedProjects.filter(
      (invitedProject: ArrayElement<Workspace["invitedProjects"]>) => invitedProject.id !== project.id,
    );
    await this.workspaceService.patchRequest(workspace, { workspaceId: workspace.id });
  }
}
