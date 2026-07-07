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

import { Component, computed, inject, input, inputBinding, signal } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { ImportationStatus, ProjectImportation } from "@tenzu/repository/importation/importation.model";
import { ProjectImportationRepositoryService } from "@tenzu/repository/importation/project-importation-repository.service";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import {
  ProjectImportationErrorDialog,
  ProjectImportationErrorDialogData,
} from "@tenzu/shared/components/project-importation-error-dialog/project-importation-error-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.component";
import { Role } from "@tenzu/repository/membership/membership.model";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations/project-invitation-repository.service";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles/project-role-repository.service";
import { AsyncPipe } from "@angular/common";
import { GetBase64FromImageUrlPipe } from "@tenzu/pipes/get-base64-from-image-url.pipe";
import { RouterLink } from "@angular/router";
import { ProjectLandingPageUrl } from "@tenzu/pipes/url/project-landing-page-url.pipe";

@Component({
  selector: "app-project-importation-card",
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    TranslocoDirective,
    MatIcon,
    MatProgressBar,
    ButtonComponent,
    AsyncPipe,
    GetBase64FromImageUrlPipe,
    RouterLink,
    ProjectLandingPageUrl,
  ],
  template: `
    @let _color = color();
    @let _importation = projectImportation();
    @let _landingPage = _importation.project | projectLandingPageUrl;
    @let _name = _importation.project?.name || "Lorem Ipsum";
    @let _description = _importation.project?.description || "Lorem Ipsum dolor sit amet";
    <mat-card
      appearance="outlined"
      class="min-h-[100px] w-[200px]"
      [class.mat-card-error]="_importation.status === ImportationStatus.FAILURE"
      *transloco="let t"
    >
      @if (_importation.status !== ImportationStatus.ACTION_NEEDED) {
        <div
          class="z-50 h-full w-full backdrop-blur-sm rounded-lg flex flex-col items-center justify-center absolute text-center"
        >
          @if (_importation.status === ImportationStatus.FAILURE) {
            <div class="flex flex-row p-0.5">
              <mat-icon class="text-error pr-3 self-center" aria-hidden="true">warning</mat-icon>
              <p class="mat-body-medium text-error align-middle">{{ t("project.new_project.import.failed") }}</p>
            </div>
            <app-button
              level="error"
              translocoKey="project.new_project.import.failed_details"
              (click)="openImportationError()"
            />
          } @else {
            <div class="flex flex-col w-full">
              <p>{{ t("project.new_project.import.ongoing") }}</p>
              <div class="flex flex-row items-center gap-3 px-3 justify-stretch">
                <mat-progress-bar
                  [mode]="_importation.extraData.progressPercentage ? 'determinate' : 'indeterminate'"
                  [value]="_importation.extraData.progressPercentage"
                ></mat-progress-bar>
                <span>{{ _importation.extraData.progressPercentage || 0 }}%</span>
              </div>
            </div>
          }
        </div>
      }
      <mat-card-header aria-hidden="true">
        <app-avatar
          mat-card-avatar
          mode="filled-square"
          [name]="_name"
          [color]="_color"
          [imageData]="_importation.project?.logo | getBase64FromImageUrl: 'small' | async"
        />
        <mat-card-title class="!contents min-h-[40px]">
          @if (_landingPage) {
            <a [routerLink]="_landingPage">{{ _name }}</a>
          } @else {
            {{ _name }}
          }
        </mat-card-title>
        @if (_importation.status === ImportationStatus.ACTION_NEEDED) {
          <app-button
            level="warning"
            [iconOnly]="true"
            iconName="warning"
            translocoKey="project.new_project.import.action_needed"
            class="ms-auto"
            iconSize="sm"
            (click)="openInviteDialog()"
          ></app-button>
        }
      </mat-card-header>
      <mat-card-content aria-hidden="true">
        <div class="pt-2 pl-2 flex flex-col gap-1">
          <p>
            {{ _description }}
          </p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
})
export class ProjectImportationCardComponent {
  protected readonly ImportationStatus = ImportationStatus;
  readonly dialog = inject(MatDialog);
  readonly projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  readonly projectImportationRepositoryService = inject(ProjectImportationRepositoryService);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly translocoService = inject(TranslocoService);

  workspaceId = input.required<WorkspaceSummary["id"]>();
  projectImportation = input.required<ProjectImportation>();

  color = computed(() => {
    const projectImportation = this.projectImportation();
    if (projectImportation.project) {
      return projectImportation.project.color;
    }
    const firstLetterCode = projectImportation.sourceName.codePointAt(0);
    return RandomColorService.castToColor(firstLetterCode || 0);
  });

  protected openImportationError() {
    const data: ProjectImportationErrorDialogData = {
      projectImportation: this.projectImportation,
      workspaceId: this.workspaceId,
    };
    this.dialog.open(ProjectImportationErrorDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }

  public async openInviteDialog() {
    const projectImportation = this.projectImportation();
    const workspaceId = this.workspaceId();
    if (projectImportation.project) {
      this.projectInvitationRepositoryService.listProjectInvitations(projectImportation.project.id).then();
      this.projectRoleRepositoryService.listRequest({ projectId: projectImportation.project.id }).then();

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
