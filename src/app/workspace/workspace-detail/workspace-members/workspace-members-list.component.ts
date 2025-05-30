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
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { MatTableModule } from "@angular/material/table";
import { UserStore } from "@tenzu/repository/user";
import { MembershipRoleComponent } from "@tenzu/shared/components/memberships/membership-role.component";
import { WorkspaceDetail, WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { Role } from "@tenzu/repository/membership";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";

@Component({
  selector: "app-workspace-members",
  imports: [TranslocoDirective, UserCardComponent, MatTableModule, MembershipRoleComponent],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <ng-container *transloco="let t">
        @let workspaceMemberships = workspaceMembershipRepositoryService.entities();
        @let myUser = userStore.myUser();
        @if (workspaceMemberships.length > 0) {
          <div class="app-table">
            <div class="app-table-row-group">
              @for (membership of workspaceMemberships; track membership.user.id) {
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
                      itemType="workspace"
                      [entityRole]="workspace"
                      [isSelf]="myUser.id === membership.user.id"
                      (changedSelf)="changeUserRole($event)"
                    ></app-membership-role>
                  </div>
                  <div class="app-table-cell">
                    <p class="text-on-surface-variant">
                      {{ t("workspace.members.total_projects", { number: membership.totalProjectsIsMember }) }}
                    </p>
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
export default class WorkspaceMembersComponent {
  readonly userStore = inject(UserStore);
  readonly workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  readonly workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);

  changeUserRole({ roleId, entityRole }: { roleId: Role["id"]; entityRole: WorkspaceDetail }) {
    const role = this.workspaceRoleRepositoryService.entityMapSummary()[roleId];
    this.workspaceRepositoryService.updateEntityDetail({ ...entityRole, userRole: role });
  }
}
