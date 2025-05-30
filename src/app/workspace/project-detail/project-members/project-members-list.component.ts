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
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { MembershipRoleComponent } from "@tenzu/shared/components/memberships/membership-role.component";

@Component({
  selector: "app-project-members",
  imports: [TranslocoDirective, UserCardComponent, MatTableModule, MembershipRoleComponent],
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
                    ></app-membership-role>
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
  readonly userStore = inject(UserStore);
  readonly projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
}
