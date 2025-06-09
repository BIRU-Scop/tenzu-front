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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatNavList } from "@angular/material/list";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIconAnchor } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { SideNavStore } from "@tenzu/repository/sidenav";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";

@Component({
  selector: "app-sidenav-list-workflow",
  imports: [
    MatIcon,
    MatListItem,
    RouterLinkActive,
    RouterLink,
    TranslocoDirective,
    MatNavList,
    MatListItemIcon,
    MatIconAnchor,
    MatTooltip,
    HasPermissionDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      @let project = projectService.entityDetail();
      @let workspace = workspaceService.entityDetail();
      @if (project && project?.workflows && workspace) {
        <ng-container
          *appHasPermission="{
            actualEntity: project,
            requiredPermission: ProjectPermissions.VIEW_WORKFLOW,
          }"
        >
          @let _canCreateWorkflow = canCreateWorkflow();
          @if (!sideNavStore.resized()) {
            <div class="flex flex-row items-center gap-2 px-2 py-1">
              <span class="text-on-surface-variant mat-body-medium">{{ t("workspace.general_title.kanban") }}</span>
              <ng-container
                *appHasPermission="{
                  actualEntity: project,
                  requiredPermission: ProjectPermissions.CREATE_WORKFLOW,
                }"
              >
                <div
                  [matTooltip]="!_canCreateWorkflow ? t('workflow.create_workflow.dialog.maximum_reached') : ''"
                  [matTooltipDisabled]="_canCreateWorkflow"
                >
                  <a
                    mat-icon-button
                    [attr.aria-label]="t('workspace.general_title.create_kanban')"
                    [routerLink]="['/workspace', workspace.id, 'project', project.id, 'new-workflow']"
                    [disabled]="!_canCreateWorkflow"
                  >
                    <mat-icon>add</mat-icon>
                  </a>
                </div>
              </ng-container>
            </div>
          } @else {
            <ng-container
              *appHasPermission="{
                actualEntity: project,
                requiredPermission: ProjectPermissions.CREATE_WORKFLOW,
              }"
            >
              <div
                [matTooltip]="!_canCreateWorkflow ? t('workflow.create_workflow.dialog.maximum_reached') : ''"
                [matTooltipDisabled]="_canCreateWorkflow"
              >
                <a
                  class="resized"
                  mat-icon-button
                  [attr.aria-label]="t('workspace.general_title.create_kanban')"
                  [routerLink]="['/workspace', workspace.id, 'project', project.id, 'new-workflow']"
                  [disabled]="!_canCreateWorkflow"
                >
                  <mat-icon>add</mat-icon>
                </a>
              </div>
            </ng-container>
          }

          <mat-nav-list attr.aria-label="{{ t('workspace.general_title.kanban') }}">
            @for (workflow of project.workflows; track workflow.id) {
              @if (!sideNavStore.resized()) {
                <a
                  mat-list-item
                  href="#"
                  [routerLink]="['/workspace', workspace.id, 'project', project.id, 'kanban', workflow.slug]"
                  routerLinkActive
                  #routerLinkActive="routerLinkActive"
                  [activated]="routerLinkActive.isActive"
                >
                  <mat-icon matListItemIcon>view_column</mat-icon>
                  {{ workflow?.name }}
                </a>
              } @else {
                <a
                  class="resized"
                  mat-list-item
                  href="#"
                  [routerLink]="['/workspace', workspace.id, 'project', project.id, 'kanban', workflow.slug]"
                  routerLinkActive
                  #routerLinkActive="routerLinkActive"
                  [activated]="routerLinkActive.isActive"
                >
                  <mat-icon class="pt-1">view_column</mat-icon>
                </a>
              }
            }
          </mat-nav-list>
        </ng-container>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavListWorkflowComponent {
  protected readonly ProjectPermissions = ProjectPermissions;

  projectService = inject(ProjectRepositoryService);
  workspaceService = inject(WorkspaceRepositoryService);
  sideNavStore = inject(SideNavStore);
  canCreateWorkflow = this.projectService.canCreateWorkflow;
}
