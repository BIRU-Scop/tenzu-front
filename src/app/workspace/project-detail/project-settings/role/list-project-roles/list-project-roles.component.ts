/*
 * Copyright (C) 2025 BIRU
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

import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from "@angular/core";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-list-project-roles",
  imports: [TranslocoDirective, PermissionOrRedirectDirective, RouterLink],
  template: `
    <div class="app-table" *transloco="let t; prefix: 'project.settings.roles'">
      <div
        class="app-table-row-group"
        [appPermissionOrRedirect]="{
          expectedId: projectId(),
          requiredPermission: ProjectPermissions.CREATE_MODIFY_DELETE_ROLE,
          type: 'project',
        }"
      >
        @for (role of entitiesSummary(); track role.id) {
          <div class="app-table-row">
            <div class="app-table-cell">{{ role.name }}</div>
            <div class="app-table-cell">{{ role.totalMembers }} {{ t("total_members") }}</div>
            <div class="app-table-cell">
              <a [routerLink]="['..', 'edit-role', role.id]">
                {{ role.editable ? t("editable") : t("not_editable") }}</a
              >
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListProjectRolesComponent implements OnInit {
  columns = signal(["name", "totalMembers", "editable"]);
  projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  entitiesSummary = this.projectRoleRepositoryService.entitiesSummary;
  projectId = input.required<string>();
  protected readonly ProjectPermissions = ProjectPermissions;
  ngOnInit(): void {
    this.projectRoleRepositoryService.listRequest({ projectId: this.projectId() }).then();
  }
}
