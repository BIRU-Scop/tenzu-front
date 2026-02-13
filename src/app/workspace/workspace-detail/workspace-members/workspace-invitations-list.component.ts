/*
 * Copyright (C) 2024-2026 BIRU
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
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { InvitationStatusComponent } from "@tenzu/shared/components/invitations/invitation-status.component";
import { InvitationActionsComponent } from "@tenzu/shared/components/invitations/invitation-actions.component";
import { InvitationRoleComponent } from "@tenzu/shared/components/invitations/invitation-role.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-workspace-members",
  imports: [
    TranslocoDirective,
    InvitationStatusComponent,
    InvitationActionsComponent,
    InvitationRoleComponent,
    PermissionOrRedirectDirective,
  ],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <ng-container *transloco="let t">
        <ng-container
          [appPermissionOrRedirect]="{
            expectedId: workspace.id,
            requiredPermission: WorkspacePermissions.CREATE_MODIFY_MEMBER,
            type: 'workspace',
            redirectUrl: ['..'],
            redirectUrlExtras: { relativeTo: activatedRoute },
          }"
        >
          @let workspaceInvitations = workspaceInvitationRepositoryService.entities();
          @if (workspaceInvitations.length > 0) {
            <div class="app-table" [@newItemsFlyIn]="workspaceInvitations.length">
              <div class="app-table-row-group">
                @for (invitation of workspaceInvitations; track invitation.id) {
                  <div class="app-table-row">
                    <div class="app-table-cell basis-1/3">{{ invitation.email }}</div>
                    <div class="app-table-cell basis-1/3">
                      <app-invitation-role
                        [invitation]="invitation"
                        itemType="workspace"
                        [userRole]="workspace.userRole"
                      />
                    </div>
                    <div class="app-table-cell basis-full">
                      <app-invitation-status [invitation]="invitation" />
                    </div>
                    <div class="app-table-cell basis-1/2">
                      <app-invitation-actions
                        [invitation]="invitation"
                        [item]="workspace"
                        itemType="workspace"
                        [resentInvitation]="resentInvitationId() === invitation.id"
                        (resend)="resendInvitation($event)"
                        (revoke)="workspaceInvitationRepositoryService.revokeWorkspaceInvitation($event)"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <p class="mat-body-medium text-on-surface-variant mt-4">{{ t("workspace.members.invitation_empty") }}</p>
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
  readonly workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  readonly activatedRoute = inject(ActivatedRoute);

  resentInvitationId = signal<WorkspaceInvitation["id"] | null>(null);

  resendInvitation(invitationId: WorkspaceInvitation["id"]) {
    this.workspaceInvitationRepositoryService.resendWorkspaceInvitation(invitationId);
    this.resentInvitationId.set(invitationId);
  }
}
