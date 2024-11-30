/*
 * Copyright (C) 2024 BIRU
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
import { ProjectStore } from "@tenzu/data/project";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb/breadcrumb.store";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { WorkflowStore } from "@tenzu/data/workflow";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";

@Component({
  selector: "app-workspace-project-list",
  imports: [ProjectCardComponent, TranslocoDirective, MatButton, MatIcon, RouterLink, CardSkeletonComponent],
  template: ` <div class="flex flex-col gap-y-8 w-full" *transloco="let t">
    <div class="flex flex-row justify-between">
      <h1 class="mat-headline-medium ">{{ t("workspace.list_projects.title") }}</h1>
      @let workspace = workspaceStore.selectedEntity();
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
      @for (project of projectStore.entities(); track project.id) {
        <app-project-card
          class="basis-1/5"
          [name]="project.name"
          [color]="project.color"
          [workspaceId]="project.workspaceId"
          [projectId]="project.id"
          [description]="project.description ? project.description : null"
        ></app-project-card>
      } @empty {
        @for (skeleton of Array(6); track $index) {
          <li><app-card-skeleton></app-card-skeleton></li>
        }
      }
    </div>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceProjectListComponent implements AfterViewInit {
  projectStore = inject(ProjectStore);
  workspaceStore = inject(WorkspaceStore);
  workflowStore = inject(WorkflowStore);
  breadcrumbStore = inject(BreadcrumbStore);

  ngAfterViewInit(): void {
    this.breadcrumbStore.setThirdLevel({
      label: "workspace.general_title.workspaceListProjects",
      link: "",
      doTranslation: true,
    });
  }

  protected readonly Array = Array;
}
