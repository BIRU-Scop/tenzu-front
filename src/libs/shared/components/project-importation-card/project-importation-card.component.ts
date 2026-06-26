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

import { Component, computed, inject, input } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import {
  ImportationStatus,
  ProjectImportation,
  ProjectImportationRepositoryService,
} from "@tenzu/repository/importation";
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
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";

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
  ],
  template: `
    @let _name = "Lorem Ipsum";
    @let _color = color();
    @let _description = "Lorem Ipsum dolor sit amet";
    @let _importation = projectImportation();
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
        <app-avatar mat-card-avatar mode="filled-square" [name]="_name" [color]="_color" />
        <mat-card-title class="!contents min-h-[40px]">{{ _name }}</mat-card-title>
        @if (_importation.status === ImportationStatus.ACTION_NEEDED) {
          <!--          TODO text content-->
          <app-button
            level="warning"
            [iconOnly]="true"
            iconName="warning"
            translocoKey="TODO"
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
    const firstLetterCode = this.projectImportation().sourceName.codePointAt(0);
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
    if (projectImportation.project) {
      this.projectInvitationRepositoryService.listProjectInvitations(projectImportation.project.id).then();
      this.projectRoleRepositoryService.listRequest({ projectId: projectImportation.project.id }).then();

      // TODO remove async/await and just use .then() in order to prevent blocking
      //  once we have switch all data argument to binding signals
      await Promise.all([
        this.projectInvitationRepositoryService.listProjectInvitations(projectImportation.project.id),
        this.projectRoleRepositoryService.listRequest({ projectId: projectImportation.project.id }),
      ]);
      const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
        ...matDialogConfig,
        minWidth: 850,
        data: {
          // TODO text content
          title: this.translocoService.translate("TODO", {
            name: projectImportation.project.name,
          }),
          // TODO text content
          description: this.translocoService.translateObject("TODO"),
          existingMembers: signal([]), // members shouldn't ever be present in pending invites list so we don't need this check
          existingInvitations: this.projectInvitationRepositoryService.entities,
          itemType: "project",
          userRole: this.projectRoleRepositoryService.ownerRole(),
        },
      });
      dialogRef.afterClosed().subscribe();
    }
  }
}
