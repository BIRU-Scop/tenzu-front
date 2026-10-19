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

import { AfterViewInit, Component, computed, inject } from "@angular/core";
import { ProjectNested } from "@tenzu/repository/project/project.model";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective } from "@jsverse/transloco";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { MatDialog } from "@angular/material/dialog";
import { ProjectCardListComponent } from "@tenzu/shared/components/project-card-list/project-card-list.component";
import { ProjectImportationRepositoryService } from "@tenzu/repository/importation/project-importation-repository.service";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";

@Component({
  selector: "app-workspace-project-list",
  imports: [TranslocoDirective, CardSkeletonComponent, ButtonAddComponent, ProjectCardListComponent],
  template: ` <div class="flex flex-col gap-y-8 w-full" *transloco="let t">
    @let workspace = workspaceSummary();
    <div class="flex flex-row justify-between">
      <h1 #listHeading class="mat-headline-medium" tabindex="-1">{{ t("workspace.list_projects.title") }}</h1>
      @if (workspace && workspace.userCanCreateProjects) {
        <app-button-add
          [level]="'tertiary'"
          [translocoKey]="'commons.project'"
          (click)="openCreateProject(workspace.id)"
        />
      }
    </div>
    @if (workspace) {
      <app-project-card-list
        class="flex flex-row flex-wrap gap-4"
        [workspace]="workspace"
        [focusFallback]="listHeading"
        (acceptProjectInvitation)="acceptProjectInvitation($event)"
        (denyProjectInvitation)="denyProjectInvitation($event)"
      />
    } @else {
      <div class="flex flex-row flex-wrap gap-4">
        @for (skeleton of Array(6); track $index) {
          <li>
            <app-card-skeleton />
          </li>
        }
      </div>
    }
  </div>`,
  styles: ``,
})
export default class WorkspaceProjectListComponent implements AfterViewInit {
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly projectImportationRepositoryService = inject(ProjectImportationRepositoryService);

  readonly breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  workspaceSummary = computed<WorkspaceSummary | null>(() => {
    const workspace = this.workspaceRepositoryService.entityDetail();
    const userInvitedProjects = this.projectRepositoryService
      .entitiesSummary()
      .filter((project) => project.userIsInvited);
    const userMemberProjects = this.projectRepositoryService
      .entitiesSummary()
      .filter((project) => !project.userIsInvited);
    const userImportedProjects = this.projectImportationRepositoryService.entities();
    return workspace
      ? {
          ...workspace,
          userInvitedProjects: [...(userInvitedProjects || [])],
          userMemberProjects: [...(userMemberProjects || [])],
          userImportedProjects: [...userImportedProjects],
        }
      : null;
  });

  ngAfterViewInit(): void {
    this.breadcrumbStore.setPathComponent("workspaceProjectList");
  }

  async acceptProjectInvitation(project: ProjectNested) {
    const _project = this.projectRepositoryService.entityMapSummary()[project.id];
    if (_project) {
      this.projectRepositoryService.updateEntitySummary(project.id, {
        ...project,
        userIsInvited: false,
      });
    }
  }

  async denyProjectInvitation(project: ProjectNested) {
    const _project = this.projectRepositoryService.entityMapSummary()[project.id];
    if (_project) {
      this.projectRepositoryService.deleteEntitySummary(_project.id);
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
