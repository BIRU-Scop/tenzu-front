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

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { WorkspaceInvitation, WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { MatRow, MatRowDef, MatTableModule } from "@angular/material/table";
import { InvitationStatusComponent } from "@tenzu/shared/components/invitations/invitation-status.component";
import { InvitationActionsComponent } from "@tenzu/shared/components/invitations/invitation-actions.component";
import { InvitationRoleComponent } from "@tenzu/shared/components/invitations/invitation-role.component";

@Component({
  selector: "app-workspace-members",
  imports: [
    TranslocoDirective,
    HasPermissionDirective,
    MatTableModule,
    MatRow,
    MatRowDef,
    InvitationStatusComponent,
    InvitationActionsComponent,
    InvitationRoleComponent,
  ],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <ng-container *transloco="let t">
        <ng-container
          *appHasPermission="{
            actualEntity: workspace,
            requiredPermission: WorkspacePermissions.CREATE_MODIFY_MEMBER,
          }"
        >
          @let workspaceInvitations = workspaceInvitationRepositoryService.entities();
          @if (workspaceInvitations.length > 0) {
            <mat-table [@newItemsFlyIn]="workspaceInvitations.length" [dataSource]="workspaceInvitations">
              <ng-container matColumnDef="user">
                <mat-cell *matCellDef="let row" class="basis-1/3">{{ row.email }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="role">
                <mat-cell *matCellDef="let row" class="basis-1/3">
                  <app-invitation-role
                    [invitation]="row"
                    itemType="workspace"
                    [userRole]="workspace.userRole"
                  ></app-invitation-role>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="status">
                <mat-cell *matCellDef="let row" class="basis-full">
                  <app-invitation-status [invitation]="row"></app-invitation-status>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="actions">
                <mat-cell *matCellDef="let row" class="basis-1/2">
                  <app-invitation-actions
                    [invitation]="row"
                    [item]="workspace"
                    itemType="workspace"
                    [resentInvitation]="resentInvitationId() === row.id"
                    (resend)="resendInvitation($event)"
                    (revoke)="workspaceInvitationRepositoryService.revokeWorkspaceInvitation($event)"
                  ></app-invitation-actions>
                </mat-cell>
              </ng-container>
              <mat-row *matRowDef="let row; columns: ['user', 'role', 'status', 'actions']"></mat-row>
            </mat-table>
          } @else {
            <p class="mat-body-medium text-on-surface-variant">{{ t("workspace.members.invitation_empty") }}</p>
          }
        </ng-container>
      </ng-container>
    }
  `,
  animations: [
    trigger("newItemsFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(50, [animate("200ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceMembersComponent {
  protected readonly WorkspacePermissions = WorkspacePermissions;

  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);

  resentInvitationId = signal<WorkspaceInvitation["id"] | null>(null);

  resendInvitation(invitationId: WorkspaceInvitation["id"]) {
    this.workspaceInvitationRepositoryService.resendWorkspaceInvitation(invitationId);
    this.resentInvitationId.set(invitationId);
  }
}
