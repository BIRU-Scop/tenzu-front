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
import { TranslocoDirective } from "@jsverse/transloco";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { MatTableModule } from "@angular/material/table";
import { UserStore } from "@tenzu/repository/user";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { MembershipRoleComponent } from "@tenzu/shared/components/memberships/membership-role.component";
import { Role } from "@tenzu/repository/membership";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { MembershipActionsComponent } from "@tenzu/shared/components/memberships/membership-actions.component";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { PermissionsBase } from "@tenzu/repository/permission/permission.model";
import { LowerCasePipe } from "@angular/common";

@Component({
  selector: "app-project-members",
  imports: [
    TranslocoDirective,
    UserCardComponent,
    MatTableModule,
    MembershipRoleComponent,
    MembershipActionsComponent,
    LowerCasePipe,
  ],
  template: `
    @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <ng-container *transloco="let t">
        @let projectMemberships = projectMembershipRepositoryService.entities();
        @let myUser = userStore.myUser();
        @if (projectMemberships.length > 0) {
          <div class="app-table">
            <div class="app-table-row-group">
              @for (membership of projectMemberships; track membership.user.id) {
                <div class="app-table-row">
                  <div class="app-table-cell">
                    <app-user-card
                      [fullName]="membership.user.fullName"
                      [username]="membership.user.username"
                      [color]="membership.user.color"
                      [isSelf]="myUser.id === membership.user.id"
                    ></app-user-card>
                  </div>
                  <div class="app-table-cell">
                    <app-membership-role
                      [membership]="membership"
                      itemType="project"
                      [entityRole]="project"
                      [isSelf]="myUser.id === membership.user.id"
                      (changedSelf)="changeUserRole($event)"
                    ></app-membership-role>
                  </div>
                  <div class="app-table-cell">
                    <app-membership-actions
                      [membership]="membership"
                      [itemLabel]="t('commons.project') | lowercase"
                      [hasDeletePermission]="
                        hasEntityRequiredPermission({
                          requiredPermission: PermissionsBase.DELETE_MEMBER,
                          actualEntity: project,
                        })
                      "
                      [userRole]="project.userRole"
                      [ownerRole]="projectRoleRepositoryService.ownerRole()"
                      [isSelf]="myUser.id === membership.user.id"
                    ></app-membership-actions>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </ng-container>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectMembersComponent {
  protected readonly hasEntityRequiredPermission = hasEntityRequiredPermission;
  protected readonly PermissionsBase = PermissionsBase;

  readonly userStore = inject(UserStore);
  readonly projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);

  changeUserRole({ roleId, entityRole }: { roleId: Role["id"]; entityRole: ProjectDetail }) {
    const role = this.projectRoleRepositoryService.entityMapSummary()[roleId];
    this.projectRepositoryService.updateEntityDetail({ ...entityRole, userRole: role });
  }
}
