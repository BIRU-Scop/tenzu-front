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

import { ChangeDetectionStrategy, Component, inject, Signal } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { WorkspaceMembership, WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { MatTableModule } from "@angular/material/table";
import { UserNested, UserStore } from "@tenzu/repository/user";
import { MembershipRoleComponent } from "@tenzu/shared/components/memberships/membership-role.component";
import { WorkspaceDetail, WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { Role } from "@tenzu/repository/membership";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";
import { LowerCasePipe } from "@angular/common";
import { MembershipActionsComponent } from "@tenzu/shared/components/memberships/membership-actions.component";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { PermissionsBase } from "@tenzu/repository/permission/permission.model";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { DeleteWorkspaceMembershipDialogComponent } from "./delete-workspace-membership-dialog.component";
import { ProjectRepositoryService } from "@tenzu/repository/project";

@Component({
  selector: "app-workspace-members",
  imports: [
    TranslocoDirective,
    UserCardComponent,
    MatTableModule,
    MembershipRoleComponent,
    LowerCasePipe,
    MembershipActionsComponent,
  ],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <ng-container *transloco="let t">
        @let workspaceMemberships = workspaceMembershipRepositoryService.entities();
        @let myUser = userStore.myUser();
        @if (workspaceMemberships.length > 0) {
          <div class="app-table">
            <div class="app-table-row-group">
              @let hasDeletePermission =
                hasEntityRequiredPermission({
                  requiredPermission: PermissionsBase.DELETE_MEMBER,
                  actualEntity: workspace,
                });
              @for (membership of workspaceMemberships; track membership.user.id) {
                <div class="app-table-row">
                  <div class="app-table-cell">
                    <app-user-card
                      [fullName]="membership.user.fullName"
                      [subtext]="membership.user.username"
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
                  <div class="app-table-cell">
                    <app-membership-actions
                      [membership]="membership"
                      [itemLabel]="t('commons.workspace') | lowercase"
                      [itemName]="workspace.name"
                      [hasDeletePermission]="hasDeletePermission"
                      [userRole]="workspace.userRole"
                      [ownerRole]="workspaceRoleRepositoryService.ownerRole()"
                      [isSelf]="myUser.id === membership.user.id"
                      [simpleConfirmForRemove]="false"
                      (leave)="openDeleteDialog({ membership: $event, isSelf: true })"
                      (remove)="openDeleteDialog({ membership: $event, isSelf: false })"
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
export default class WorkspaceMembersComponent {
  protected readonly hasEntityRequiredPermission = hasEntityRequiredPermission;
  protected readonly PermissionsBase = PermissionsBase;

  readonly userStore = inject(UserStore);
  readonly workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  changeUserRole({ roleId, entityRole }: { roleId: Role["id"]; entityRole: WorkspaceDetail }) {
    const role = this.workspaceRoleRepositoryService.entityMapSummary()[roleId];
    this.workspaceRepositoryService.updateEntityDetail({ ...entityRole, userRole: role });
  }

  openDeleteDialog({ membership, isSelf }: { membership: Signal<WorkspaceMembership>; isSelf: boolean }) {
    const dialogRef = this.dialog.open(DeleteWorkspaceMembershipDialogComponent, {
      ...matDialogConfig,
      data: {
        membership: membership,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe(
        async (closeValue?: { successorId?: UserNested["id"]; membership: WorkspaceMembership; delete: boolean }) => {
          if (closeValue) {
            if (closeValue.delete) {
              const workspace = this.workspaceRepositoryService.entityDetail();
              if (workspace && workspace.id === closeValue.membership.workspaceId) {
                this.workspaceRepositoryService
                  .deleteRequest(workspace, { workspaceId: closeValue.membership.workspaceId })
                  .then();
                await this.router.navigate(["/"]);
              } else {
                throw new NotFoundEntityError(`Entity ${closeValue.membership.workspaceId} not found`);
              }
            } else {
              await this.workspaceMembershipRepositoryService.deleteRequest(
                closeValue.membership.id,
                closeValue.successorId,
              );
              if (isSelf) {
                await this.router.navigate(["/"]);
              } else {
                const workspace = this.workspaceRepositoryService.entityDetail();
                if (workspace) {
                  // must be done after membership deletion
                  this.projectRepositoryService.listRequest({ workspaceId: workspace.id }).then();
                }
              }
            }
          }
        },
      );
  }
}
