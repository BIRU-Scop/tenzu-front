/*
 * Copyright (C) 2025-2026 BIRU
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

import { ChangeDetectionStrategy, Component, inject, input, signal } from "@angular/core";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { ProjectRepositoryService } from "@tenzu/repository/project";

@Component({
  selector: "app-list-roles",
  imports: [TranslocoDirective, PermissionOrRedirectDirective, RouterLink, MatButton, MatIcon],
  template: `
    @let project = projectRepositoryService.entityDetail();
    <ng-container
      [appPermissionOrRedirect]="{
        expectedId: projectId(),
        requiredPermission: ProjectPermissions.CREATE_MODIFY_DELETE_ROLE,
        type: 'project',
        redirectUrl: ['..'],
        redirectUrlExtras: { relativeTo: activatedRoute },
      }"
      *transloco="let t"
    >
      @if (project) {
        <div class="flex justify-end">
          <a [matButton]="'filled'" [routerLink]="['..', 'create-role']" class="tertiary-button mb-4">
            <mat-icon>add</mat-icon>
            {{ t("project.settings.roles.create_role") }}</a
          >
        </div>
        <div class="app-table" *transloco="let t; prefix: 'project.settings.roles'">
          <div class="app-table-row-group">
            @for (role of entitiesSummary(); track role.id) {
              <div class="app-table-row">
                <div class="app-table-cell">
                  <a [routerLink]="['..', 'edit-role', role.id]">{{ role.name }}</a>
                </div>
                <div class="app-table-cell">{{ role.totalMembers }} {{ t("total_members") }}</div>
                <div class="app-table-cell">
                  {{ role.editable ? t("editable") : t("not_editable") }}
                </div>
              </div>
            }
          </div>
        </div>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListRolesComponent {
  protected readonly ProjectPermissions = ProjectPermissions;

  projectRepositoryService = inject(ProjectRepositoryService);
  projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly activatedRoute = inject(ActivatedRoute);

  entitiesSummary = this.projectRoleRepositoryService.entitiesSummary;
  projectId = input.required<string>();
  columns = signal(["name", "totalMembers", "editable"]);
}
