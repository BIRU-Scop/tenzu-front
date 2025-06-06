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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProjectRepositoryService, ProjectSummary } from "@tenzu/repository/project";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { getProjectLandingPageUrl } from "@tenzu/utils/functions/urls";
import { ActionCardComponent } from "@tenzu/shared/components/action-card";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";

@Component({
  selector: "app-workspace-project-list",
  imports: [
    ProjectCardComponent,
    TranslocoDirective,
    MatButton,
    MatIcon,
    RouterLink,
    CardSkeletonComponent,
    ActionCardComponent,
  ],
  template: ` <div class="flex flex-col gap-y-8 w-full" *transloco="let t">
    @let workspace = workspaceService.entityDetail();
    <div class="flex flex-row justify-between">
      <h1 class="mat-headline-medium ">{{ t("workspace.list_projects.title") }}</h1>
      @if (workspace && workspace.userCanCreateProjects) {
        <button
          class="primary-button"
          routerLink="/new-project"
          [queryParams]="{ workspaceId: workspace.id }"
          mat-stroked-button
        >
          <mat-icon>add</mat-icon>
          {{ t("commons.project") }}
        </button>
      }
    </div>
    <div class="flex flex-row flex-wrap gap-4">
      @for (project of projectService.entitiesSummary(); track project.id) {
        @if (project.userIsInvited) {
          <app-action-card
            [name]="project.name"
            [color]="project.color"
            [cancelLabel]="t('component.invitation.accept')"
            [submitLabel]="t('component.invitation.deny')"
            (submitted)="acceptProjectInvitation(project)"
            (canceled)="denyProjectInvitation(project)"
          ></app-action-card>
        } @else {
          <app-project-card
            class="basis-1/5"
            [name]="project.name"
            [color]="project.color"
            [workspaceId]="project.workspaceId"
            [description]="project.description ? project.description : null"
            [landingPage]="getProjectLandingPageUrl(project)"
          ></app-project-card>
        }
      } @empty {
        @if (workspace) {
          @if (workspace.userCanCreateProjects) {
            <app-project-card [workspaceId]="workspace.id"></app-project-card>
          } @else {
            <app-project-card
              [name]="'Lorem Ipsum'"
              [color]="3"
              [description]="'Lorem Ipsum dolor sit amet'"
              [disabled]="true"
            ></app-project-card>
          }
        } @else {
          @for (skeleton of Array(6); track $index) {
            <li>
              <app-card-skeleton></app-card-skeleton>
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
  protected readonly getProjectLandingPageUrl = getProjectLandingPageUrl;
}
