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
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectRepositoryService } from "@tenzu/repository/project";

@Component({
  selector: "app-project-settings",
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    RouterOutlet,
    MatTabNav,
    MatTabLink,
    RouterLink,
    RouterLinkActive,
    MatTabNavPanel,
    HasPermissionDirective,
  ],
  template: `
    @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'project.settings'">
        <div class="flex flex-row">
          <h1 class="mat-headline-medium">{{ t("title") }}</h1>
        </div>
        <nav mat-tab-nav-bar [mat-stretch-tabs]="false" class="flex flex-row gap-x-4" [tabPanel]="tabPanel">
          @for (link of links; track link.path) {
            <a
              *appHasPermission="{ requiredPermission: link.permission, actualEntity: project }"
              mat-tab-link
              [routerLink]="link.path"
              routerLinkActive
              #RouterLinkActive="routerLinkActive"
              [active]="RouterLinkActive.isActive"
              [routerLinkActiveOptions]="{ exact: true }"
              >{{ t(link.labelKey) }}
            </a>
          }
        </nav>
        <div>
          <mat-tab-nav-panel #tabPanel><router-outlet /></mat-tab-nav-panel>
        </div>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectSettingsComponent implements AfterViewInit {
  projectRepositoryService = inject(ProjectRepositoryService);
  links = [
    {
      path: "./project-edit",
      labelKey: "project_edit.title",
      permission: ProjectPermissions.MODIFY_PROJECT,
    },
    { path: "./list-project-roles", labelKey: "roles.title", permission: ProjectPermissions.CREATE_MODIFY_DELETE_ROLE },
  ];
  breadcrumbStore = inject(BreadcrumbStore);
  ngAfterViewInit(): void {
    this.breadcrumbStore.setPathComponent("projectSettings");
  }
}
