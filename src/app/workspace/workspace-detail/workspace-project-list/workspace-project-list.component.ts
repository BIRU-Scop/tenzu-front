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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy } from "@angular/core";
import { ProjectService } from "@tenzu/data/project";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb/breadcrumb.store";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";
import { getProjectLandingPageUrl } from "@tenzu/utils/functions/urls";
import { ProjectSpecialCardComponent } from "@tenzu/shared/components/project-special-card";
import { ArrayElement } from "@tenzu/utils/functions/typing";
import { Workspace } from "@tenzu/data/workspace";
import { WorkspaceUtilsService } from "../../workspace-utils.service";
import { debug } from "@tenzu/utils/functions/logging";

@Component({
  selector: "app-workspace-project-list",
  imports: [
    ProjectCardComponent,
    TranslocoDirective,
    MatButton,
    MatIcon,
    RouterLink,
    CardSkeletonComponent,
    ProjectSpecialCardComponent,
  ],
  template: ` <div class="flex flex-col gap-y-8 w-full" *transloco="let t">
    <div class="flex flex-row justify-between">
      <h1 class="mat-headline-medium ">{{ t("workspace.list_projects.title") }}</h1>
      @let workspace = workspaceService.selectedEntity();
      @if (workspace) {
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
      @if (workspace) {
        @for (project of workspace.invitedProjects; track project.id) {
          <li>
            <app-project-special-card
              [name]="project.name"
              [color]="project.color"
              (submitted)="acceptProjectInvitation(project)"
              (canceled)="denyProjectInvitation(project)"
            ></app-project-special-card>
          </li>
        }
      }
      @for (project of projectService.entities(); track project.id) {
        <app-project-card
          class="basis-1/5"
          [name]="project.name"
          [color]="project.color"
          [workspaceId]="project.workspaceId"
          [description]="project.description ? project.description : null"
          [landingPage]="getProjectLandingPageUrl(project)"
        ></app-project-card>
      } @empty {
        @for (skeleton of Array(6); track $index) {
          <li>
            <app-card-skeleton></app-card-skeleton>
          </li>
        }
      }
    </div>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceProjectListComponent implements AfterViewInit, OnDestroy {
  ngOnDestroy(): void {
    this.projectService.resetEntities();
  }

  workspaceUtilsService = inject(WorkspaceUtilsService);
  workspaceService = inject(WorkspaceService);
  projectService = inject(ProjectService);
  breadcrumbStore = inject(BreadcrumbStore);

  ngAfterViewInit(): void {
    this.breadcrumbStore.setThirdLevel({
      label: "workspace.general_title.workspaceListProjects",
      link: "",
      doTranslation: true,
    });
  }

  async acceptProjectInvitation(project: ArrayElement<Workspace["invitedProjects"]>) {
    await this.workspaceUtilsService.acceptProjectInvitationForCurrentUser(project);
  }

  denyProjectInvitation(project: ArrayElement<Workspace["invitedProjects"]>) {
    debug("INVITATION", "Denied", project);
  }

  protected readonly Array = Array;
  protected readonly getProjectLandingPageUrl = getProjectLandingPageUrl;
}
