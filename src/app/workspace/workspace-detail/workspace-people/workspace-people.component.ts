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

import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

import { MatDialog } from "@angular/material/dialog";
import { InvitePeoplesDialogComponent } from "@tenzu/shared/components/invite-peoples-dialog/invite-peoples-dialog.component";
import { MatList } from "@angular/material/list";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { HasWorkspacePermissionDirective } from "@tenzu/directives/permission.directive";
import { MatRow, MatRowDef, MatTableModule } from "@angular/material/table";

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
  ],
  template: `
    <div class="flex flex-col gap-y-8 h-full" *transloco="let t; prefix: 'workspace.people'">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("title") }}</h1>
        <button
          *appHasWorkspacePermission="WorkspacePermissions.CREATE_MODIFY_MEMBER"
          (click)="openInviteDialog()"
          class="tertiary-button"
          mat-stroked-button
        >
          {{ t("invite_to_workspace") }}
        </button>
      </div>
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" mat-stretch-tabs="false" mat-align-tabs="start">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">group</mat-icon>
            {{ t("members_tab") }}
          </ng-template>
          <p class="mat-body-medium text-on-surface mb-2">{{ t("members_description") }}</p>
          @let workspaceMembershipEntities = workspaceMembershipService.entities();
          @if (workspaceMembershipEntities.length > 0) {
            <mat-list>
              @for (member of workspaceMembershipEntities; track member.user.username) {
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
            {{ t("invitation_tab") }}
          </ng-template>
          @let workspaceInvitations = workspaceInvitationService.entities();
          @if (workspaceInvitations.length > 0) {
            <mat-table [@newItemsFlyIn]="workspaceInvitations.length" [dataSource]="workspaceInvitations">
              <ng-container matColumnDef="user">
                <mat-cell *matCellDef="let row">{{ row.email }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="role">
                <mat-cell *matCellDef="let row">{{ row.role.name }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="status">
                <mat-cell *matCellDef="let row">{{ row.status }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="actions">
                <mat-cell *matCellDef="let row"></mat-cell>
              </ng-container>
              <mat-row *matRowDef="let row; columns: ['user', 'role', 'status', 'actions']"></mat-row>
            </mat-table>
          } @else {
            <p class="mat-body-medium text-on-surface-variant">{{ t("invitation_empty") }}</p>
          }
        </mat-tab>
      </mat-tab-group>
    </div>
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
  WorkspacePermissions: typeof WorkspacePermissions = WorkspacePermissions;
  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  readonly workspaceService = inject(WorkspaceRepositoryService);
  translocoService = inject(TranslocoService);
  workspaceInvitationService = inject(WorkspaceInvitationRepositoryService);
  workspaceMembershipService = inject(WorkspaceMembershipRepositoryService);

  selectedTabIndex = model(0);

  constructor() {
    this.breadcrumbStore.setPathComponent("workspaceMembers");
    this.selectedTabIndex.subscribe((value) => {
      if (value === 1) {
        this.workspaceInvitationService.listWorkspaceInvitations(this.workspaceService.entityDetail()!.id).then();
      }
    });
  }

  public openInviteDialog(): void {
    const dialogRef = this.dialog.open(InvitePeoplesDialogComponent, {
      ...matDialogConfig,
      minWidth: 800,
      data: {
        title:
          this.translocoService.translate("component.invite_dialog.invite_peoples") +
          " " +
          this.translocoService.translate("component.invite_dialog.to") +
          " " +
          this.workspaceService.entityDetail()?.name,
        description: this.translocoService.translate("workspace.people.description_modal"),
      },
    });
    dialogRef.afterClosed().subscribe(async (invitationEmails: string[]) => {
      const selectedWorkspace = this.workspaceService.entityDetail();
      if (selectedWorkspace && invitationEmails.length) {
        await this.workspaceInvitationService.createBulkInvitations(
          selectedWorkspace,
          // TODO use dynamic role instead
          invitationEmails.map((email) => ({ email, roleSlug: "member" })),
        );
        if (this.selectedTabIndex() !== 1) {
          this.selectedTabIndex.set(1);
        }
      }
    });
  }
}
