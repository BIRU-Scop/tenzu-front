/*
 * Copyright (C) 2026 BIRU
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

import { Component, inject, input, inputBinding, signal } from "@angular/core";
import { ProjectImportationNested } from "@tenzu/repository/importation/importation.model";
import { ProjectImportationRepositoryService } from "@tenzu/repository/importation/project-importation-repository.service";
import { MatIcon } from "@angular/material/icon";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.component";
import { Role } from "@tenzu/repository/membership/membership.model";
import { MatDialog } from "@angular/material/dialog";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations/project-invitation-repository.service";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles/project-role-repository.service";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { ProjectSummary } from "@tenzu/repository/project/project.model";

@Component({
  selector: "app-project-invitations-list-importation-warning",
  imports: [MatIcon, ButtonComponent, ButtonCloseComponent, TranslocoDirective, ConfirmDirective],
  template: `
    <ng-container *transloco="let t">
      <p class="flex flex-1 items-center gap-8">
        <mat-icon aria-hidden="true">info</mat-icon>
        <span>{{ t("project.new_project.import.invite_warning") }}</span>
      </p>
      <app-button
        type="button"
        level="secondary"
        forceAppearance="outlined"
        translocoKey="project.new_project.import.invite_action"
        (click)="openInviteDialog()"
      />
      <app-button-close
        level="secondary"
        iconSize="sm"
        [iconOnly]="true"
        [iconNoBackground]="true"
        appConfirm
        [data]="{
          deleteAction: true,
        }"
        (popupConfirm)="ignorePreviousUsers()"
      />
    </ng-container>
  `,
  styles: ``,
  host: {
    class: "mat-bg-warning-container mat-text-on-warning-container my-8 py-2 px-4 rounded flex items-center gap-8",
  },
})
export class ProjectInvitationsListImportationWarningComponent {
  readonly dialog = inject(MatDialog);
  readonly projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  readonly projectImportationRepositoryService = inject(ProjectImportationRepositoryService);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly translocoService = inject(TranslocoService);

  projectImportation = input.required<ProjectImportationNested>();
  workspaceId = input.required<WorkspaceSummary["id"]>();
  project = input.required<ProjectSummary>();

  public async ignorePreviousUsers() {
    await this.projectImportationRepositoryService.handlePendingInvites({
      projectImportation: this.projectImportation(),
      invitations: [],
      workspaceId: this.workspaceId(),
    });
  }

  public async openInviteDialog() {
    const projectImportation = this.projectImportation();
    const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
      ...matDialogConfig,
      minWidth: 850,
      bindings: [
        inputBinding(
          "title",
          signal(
            this.translocoService.translate("component.invite_dialog.invite_people_to", {
              name: this.project().name,
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
          workspaceId: this.workspaceId(),
        });
      }
    });
  }
}
