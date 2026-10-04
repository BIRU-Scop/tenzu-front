/*
 * Copyright (C) 2024-2026 BIRU
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

import { Component, computed, inject, input, inputBinding, output, signal } from "@angular/core";
import { ProjectNested, ProjectSummary } from "@tenzu/repository/project/project.model";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";
import { ProjectLandingPageUrl } from "@tenzu/pipes/url/project-landing-page-url.pipe";
import { ActionCardComponent } from "@tenzu/shared/components/action-card";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { ProjectImportationCardComponent } from "@tenzu/shared/components/project-importation-card";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations/project-invitation-repository.service";
import { ProjectImportationRepositoryService } from "@tenzu/repository/importation/project-importation-repository.service";
import { ProjectImportation } from "@tenzu/repository/importation/importation.model";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { Role } from "@tenzu/repository/membership/membership.model";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles/project-role-repository.service";
import { MatDialog } from "@angular/material/dialog";
import { TranslocoService } from "@jsverse/transloco";

@Component({
  selector: "app-project-card-list",
  imports: [ActionCardComponent, ProjectCardComponent, ProjectImportationCardComponent, ProjectLandingPageUrl],
  template: `
    @let _workspace = workspace();
    @for (project of _workspace.userInvitedProjects; track project.id) {
      <app-action-card
        [name]="project.name"
        [color]="project.color"
        [cancelLabel]="'component.invitation.deny'"
        [submitLabel]="'component.invitation.accept'"
        (submitted)="_acceptProjectInvitation(_workspace, project); acceptProjectInvitation.emit(project)"
        (canceled)="_denyProjectInvitation(_workspace, project); denyProjectInvitation.emit(project)"
      />
    }
    @for (project of _workspace.userMemberProjects; track project.id) {
      <app-project-card
        [workspaceId]="_workspace.id"
        [name]="project.name"
        [color]="project.color"
        [logo]="project.logo"
        [description]="project.description ? project.description : null"
        [landingPage]="project | projectLandingPageUrl"
      />
    }
    @for (projectImportation of _workspace.userImportedProjects; track projectImportation.id) {
      <app-project-importation-card
        [workspaceId]="_workspace.id"
        [projectImportation]="projectImportation"
        (deleteImportation)="deleteImportation($event)"
        (openInviteDialog)="openInviteDialog(projectImportation)"
      />
    }
    @if (isEmpty()) {
      @if (_workspace.userCanCreateProjects) {
        <app-project-card [workspaceId]="_workspace.id" />
      } @else {
        <app-project-card
          [workspaceId]="_workspace.id"
          [name]="'Lorem Ipsum'"
          [color]="3"
          [description]="'Lorem Ipsum dolor sit amet'"
          [disabled]="true"
        />
      }
    }
  `,
  styles: ``,
})
export class ProjectCardListComponent {
  readonly dialog = inject(MatDialog);
  readonly projectImportationRepositoryService = inject(ProjectImportationRepositoryService);
  readonly translocoService = inject(TranslocoService);
  readonly projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);

  workspace = input.required<WorkspaceSummary>();
  isEmpty = computed(() => {
    const _workspace = this.workspace();
    return (
      !_workspace.userInvitedProjects.length &&
      !_workspace.userMemberProjects.length &&
      !_workspace.userImportedProjects.length
    );
  });
  acceptProjectInvitation = output<ProjectSummary | ProjectNested>();
  denyProjectInvitation = output<ProjectSummary | ProjectNested>();

  async deleteImportation(projectImportationId: ProjectImportation["id"]) {
    const workspaceId = this.workspace().id;
    await this.projectImportationRepositoryService.deleteRequest({ projectImportationId, workspaceId });
  }
  async _acceptProjectInvitation(workspace: WorkspaceSummary, project: ProjectNested) {
    const invitation = await this.projectInvitationRepositoryService.acceptProjectInvitation({
      workspaceId: workspace.id,
      project: project,
    });
    if (invitation) {
      this.acceptProjectInvitation.emit(project);
    }
  }

  async _denyProjectInvitation(workspace: WorkspaceSummary, project: ProjectNested) {
    const invitation = await this.projectInvitationRepositoryService.denyProjectInvitation({
      workspaceId: workspace.id,
      projectId: project.id,
    });
    if (invitation) {
      this.denyProjectInvitation.emit(project);
    }
  }
  async openInviteDialog(projectImportation: ProjectImportation) {
    const workspaceId = this.workspace().id;
    if (projectImportation.project) {
      this.projectInvitationRepositoryService.listProjectInvitations(projectImportation.project.id).then();
      this.projectRoleRepositoryService.listRequest({ projectId: projectImportation.project.id }).then();

      const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
        ...matDialogConfig,
        minWidth: 850,
        bindings: [
          inputBinding(
            "title",
            signal(
              this.translocoService.translate("component.invite_dialog.invite_people_to", {
                name: projectImportation.project.name,
              }),
            ),
          ),
          inputBinding(
            "description",
            signal(this.translocoService.translateObject("project.new_project.import.invite_description_modal")),
          ),
          inputBinding("existingMembers", signal([])),
          inputBinding("existingInvitations", this.projectInvitationRepositoryService.entities),
          inputBinding("initialInvites", signal(projectImportation.pendingInvites)),
          inputBinding("itemType", signal("project")),
          inputBinding("userRole", this.projectRoleRepositoryService.ownerRole),
          inputBinding("canAddEmails", signal(false)),
        ],
      });
      dialogRef.afterClosed().subscribe(async (invitations: { email: string; roleId: Role["id"] }[] | undefined) => {
        if (invitations?.length) {
          await this.projectImportationRepositoryService.handlePendingInvites({
            projectImportation,
            invitations,
            workspaceId,
          });
        }
      });
    }
  }
}
