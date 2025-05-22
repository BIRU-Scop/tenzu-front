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

import { ChangeDetectionStrategy, Component, inject, model, signal } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

import { MatDialog } from "@angular/material/dialog";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invite-people-dialog/invite-people-dialog.component";
import { MatList } from "@angular/material/list";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { WorkspaceInvitation, WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { HasWorkspacePermissionDirective } from "@tenzu/directives/permission.directive";
import { MatRow, MatRowDef, MatTableModule } from "@angular/material/table";
import { InvitationStatusComponent } from "@tenzu/shared/components/invitation-status/invitation-status.component";
import { WorkspaceRolesRepositoryService } from "@tenzu/repository/workspace-roles";
import { InvitationActionsComponent } from "@tenzu/shared/components/invitation-actions/invitation-actions.component";

@Component({
  selector: "app-workspace-people",
  imports: [
    TranslocoDirective,
    MatButton,
    MatIcon,
    MatList,
    MatTabGroup,
    MatTab,
    UserCardComponent,
    MatTabLabel,
    HasWorkspacePermissionDirective,
    MatTableModule,
    MatRow,
    MatRowDef,
    InvitationStatusComponent,
    InvitationActionsComponent,
  ],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      @let workspaceRoleEntityMapSummary = workspaceRoleRepositoryService.entityMapSummary();
      <div class="flex flex-col gap-y-8 h-full" *transloco="let t">
        <div class="flex flex-row">
          <h1 class="mat-headline-medium grow">{{ t("workspace.people.title") }}</h1>
          <button
            *appHasWorkspacePermission="WorkspacePermissions.CREATE_MODIFY_MEMBER"
            (click)="openInviteDialog()"
            class="tertiary-button"
            mat-stroked-button
          >
            {{ t("workspace.people.invite_to_workspace") }}
          </button>
        </div>
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" mat-stretch-tabs="false" mat-align-tabs="start">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="icon-sm mr-1">group</mat-icon>
              {{ t("workspace.people.members_tab") }}
            </ng-template>
            <p class="mat-body-medium text-on-surface mb-2">{{ t("workspace.people.members_description") }}</p>
            @let workspaceMembershipEntities = workspaceMembershipRepositoryService.entities();
            @if (workspaceMembershipEntities.length > 0) {
              <mat-list>
                @for (member of workspaceMembershipEntities; track member.user.id) {
                  <app-user-card
                    [fullName]="member.user.fullName"
                    [username]="member.user.username"
                    [color]="member.user.color"
                  ></app-user-card>
                }
              </mat-list>
            }
          </mat-tab>
          <mat-tab *appHasWorkspacePermission="WorkspacePermissions.CREATE_MODIFY_MEMBER">
            <ng-template mat-tab-label>
              <mat-icon class="icon-sm mr-1">mail</mat-icon>
              {{ t("workspace.people.invitation_tab") }}
            </ng-template>
            @let workspaceInvitations = workspaceInvitationRepositoryService.entities();
            @if (workspaceInvitations.length > 0) {
              <mat-table [@newItemsFlyIn]="workspaceInvitations.length" [dataSource]="workspaceInvitations">
                <ng-container matColumnDef="user">
                  <mat-cell *matCellDef="let row" class="basis-1/3">{{ row.email }}</mat-cell>
                </ng-container>
                <ng-container matColumnDef="role">
                  <mat-cell *matCellDef="let row" class="basis-1/3"
                    >{{ workspaceRoleEntityMapSummary[row.roleId].name }}
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
              <p class="mat-body-medium text-on-surface-variant">{{ t("workspace.people.invitation_empty") }}</p>
            }
          </mat-tab>
        </mat-tab-group>
      </div>
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
export default class WorkspacePeopleComponent {
  protected readonly WorkspacePermissions = WorkspacePermissions;

  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  workspaceRoleRepositoryService = inject(WorkspaceRolesRepositoryService);
  translocoService = inject(TranslocoService);

  selectedTabIndex = model(0);

  resentInvitationId = signal<WorkspaceInvitation["id"] | null>(null);

  constructor() {
    this.breadcrumbStore.setPathComponent("workspaceMembers");
    this.selectedTabIndex.subscribe((value) => {
      if (value === 1) {
        this.workspaceInvitationRepositoryService
          .listWorkspaceInvitations(this.workspaceRepositoryService.entityDetail()!.id)
          .then();
      }
    });
  }

  resendInvitation(invitationId: WorkspaceInvitation["id"]) {
    this.workspaceInvitationRepositoryService.resendWorkspaceInvitation(invitationId);
    this.resentInvitationId.set(invitationId);
  }

  public openInviteDialog(): void {
    this.workspaceInvitationRepositoryService
      .listWorkspaceInvitations(this.workspaceRepositoryService.entityDetail()!.id)
      .then();
    const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
      ...matDialogConfig,
      minWidth: 800,
      data: {
        title: this.translocoService.translate("component.invite_dialog.invite_people_to", {
          name: this.workspaceRepositoryService.entityDetail()?.name,
        }),
        description: this.translocoService.translate("workspace.people.description_modal"),
        existingMembers: this.workspaceMembershipRepositoryService.members,
        existingInvitations: this.workspaceInvitationRepositoryService.entities,
      },
    });
    dialogRef.afterClosed().subscribe(async (invitationEmails: string[] | undefined) => {
      const selectedWorkspace = this.workspaceRepositoryService.entityDetail();
      if (selectedWorkspace && invitationEmails?.length) {
        await this.workspaceInvitationRepositoryService.createBulkInvitations(
          selectedWorkspace,
          // TODO use dynamic role instead (not working)
          invitationEmails.map((email) => ({ email, roleId: "member" })),
        );
        if (this.selectedTabIndex() !== 1) {
          this.selectedTabIndex.set(1);
        }
      }
    });
  }
}
