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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProjectRepositoryService, ProjectSummary } from "@tenzu/repository/project";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective } from "@jsverse/transloco";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { ActionCardComponent } from "@tenzu/shared/components/action-card";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { MatDialog } from "@angular/material/dialog";
import { ProjectLandingPageUrl } from "@tenzu/pipes/projectLandingPageUrl.pipe";

@Component({
  selector: "app-workspace-project-list",
  imports: [
    ProjectCardComponent,
    TranslocoDirective,
    CardSkeletonComponent,
    ActionCardComponent,
    ButtonAddComponent,
    ProjectLandingPageUrl,
  ],
  template: ` <div class="flex flex-col gap-y-8 w-full" *transloco="let t">
    @let workspace = workspaceService.entityDetail();
    <div class="flex flex-row justify-between">
      <h1 class="mat-headline-medium ">{{ t("workspace.list_projects.title") }}</h1>
      @if (workspace && workspace.userCanCreateProjects) {
        <app-button-add
          [level]="'primary'"
          [translocoKey]="'commons.project'"
          (click)="openCreateProject(workspace.id)"
        ></app-button-add>
      }
    </div>
    <div class="flex flex-row flex-wrap gap-4">
      @for (project of projectService.entitiesSummary(); track project.id) {
        @if (project.userIsInvited) {
          <app-action-card
            [name]="project.name"
            [color]="project.color"
            [cancelLabel]="'component.invitation.deny'"
            [submitLabel]="'component.invitation.accept'"
            (submitted)="acceptProjectInvitation(project)"
            (canceled)="denyProjectInvitation(project)"
          />
        } @else {
          <app-project-card
            [name]="project.name"
            [color]="project.color"
            [logo]="project.logo"
            [workspaceId]="project.workspaceId"
            [description]="project.description ? project.description : null"
            [landingPage]="project | projectLandingPageUrl"
          />
        }
      } @empty {
        @if (workspace) {
          @if (workspace.userCanCreateProjects) {
            <app-project-card [workspaceId]="workspace.id" />
          } @else {
            <app-project-card
              [workspaceId]="workspace.id"
              [name]="'Lorem Ipsum'"
              [color]="3"
              [description]="'Lorem Ipsum dolor sit amet'"
              [disabled]="true"
            />
          }
        } @else {
          @for (skeleton of Array(6); track $index) {
            <li>
              <app-card-skeleton />
            </li>
          }
        }
      }
    </div>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceProjectListComponent implements AfterViewInit {
  readonly workspaceService = inject(WorkspaceRepositoryService);
  readonly projectService = inject(ProjectRepositoryService);
  readonly projectInvitationService = inject(ProjectInvitationRepositoryService);
  readonly breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);

  ngAfterViewInit(): void {
    this.breadcrumbStore.setPathComponent("workspaceProjectList");
  }

  async acceptProjectInvitation(project: ProjectSummary) {
    const updatedInvitation = await this.projectInvitationService.acceptInvitationForCurrentUser(project.id);
    if (updatedInvitation) {
      project.userIsInvited = false;
      this.projectService.updateEntitySummary(project.id, project);
    }
  }

  async denyProjectInvitation(project: ProjectSummary) {
    const updatedInvitation = await this.projectInvitationService.denyInvitationForCurrentUser(project.id);
    if (updatedInvitation) {
      this.projectService.deleteEntitySummary(project.id);
    }
  }

  protected readonly Array = Array;

  openCreateProject(workspaceId: string): void {
    const data: ProjectCreateDialogData = {
      workspaceId,
    };
    this.dialog.open(ProjectCreateDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
