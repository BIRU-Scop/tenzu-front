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
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { InvitePeoplesDialogComponent } from "@tenzu/shared/components/invite-peoples-dialog/invite-peoples-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { MatList } from "@angular/material/list";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { MatIcon } from "@angular/material/icon";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { HasProjectPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { MatCell, MatTableModule } from "@angular/material/table";
import { InvitationStatusComponent } from "@tenzu/shared/components/invitation-status/invitation-status.component";
import { ProjectRolesRepositoryService } from "@tenzu/repository/project-roles";

@Component({
  selector: "app-project-members",
  imports: [
    TranslocoDirective,
    MatButton,
    MatList,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    UserCardComponent,
    MatIcon,
    HasProjectPermissionDirective,
    MatCell,
    MatTableModule,
    InvitationStatusComponent,
  ],
  template: `
    @let projectRoleEntityMapSummary = projectRoleRepositoryService.entityMapSummary();
    <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'project.members'">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("title") }}</h1>

        <button
          *appHasProjectPermission="ProjectPermissions.CREATE_MODIFY_MEMBER"
          (click)="openCreateDialog()"
          class="tertiary-button"
          mat-stroked-button
        >
          {{ t("invite_to_project") }}
        </button>
      </div>
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" mat-stretch-tabs="false" mat-align-tabs="start">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">group</mat-icon>
            {{ t("members_tab") }}
          </ng-template>
          @let projectMemberships = projectMembershipService.entities();
          @if (projectMemberships.length > 0) {
            <mat-list>
              @for (member of projectMemberships; track member.user.username) {
                <app-user-card
                  [fullName]="member.user.fullName"
                  [username]="member.user.username"
                  [color]="member.user.color"
                ></app-user-card>
              }
            </mat-list>
          }
        </mat-tab>
        <mat-tab *appHasProjectPermission="ProjectPermissions.CREATE_MODIFY_MEMBER">
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">mail</mat-icon>
            {{ t("invitation_tab") }}
          </ng-template>
          @let projectInvitations = projectInvitationService.entities();
          @if (projectInvitations.length > 0) {
            <mat-table [@newItemsFlyIn]="projectInvitations.length" [dataSource]="projectInvitations">
              <ng-container matColumnDef="user">
                <mat-cell *matCellDef="let row" class="basis-1/3">{{ row.email }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="role">
                <mat-cell *matCellDef="let row" class="basis-1/3">{{
                  projectRoleEntityMapSummary[row.roleId].name
                }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="status">
                <mat-cell *matCellDef="let row" class="basis-full">
                  <app-invitation-status [invitation]="row"></app-invitation-status>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="actions">
                <mat-cell *matCellDef="let row" class="basis-1/3"></mat-cell>
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
export class ProjectMembersComponent {
  ProjectPermissions: typeof ProjectPermissions = ProjectPermissions;

  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  projectService = inject(ProjectRepositoryService);
  projectInvitationService = inject(ProjectInvitationRepositoryService);
  projectMembershipService = inject(ProjectMembershipRepositoryService);
  projectRoleRepositoryService = inject(ProjectRolesRepositoryService);
  translocoService = inject(TranslocoService);

  selectedTabIndex = model(0);

  constructor() {
    this.breadcrumbStore.setPathComponent("projectMembers");
    this.selectedTabIndex.subscribe((value) => {
      if (value === 1) {
        this.projectInvitationService.listProjectInvitations(this.projectService.entityDetail()!.id).then();
      }
    });
  }

  public openCreateDialog(): void {
    const dialogRef = this.dialog.open(InvitePeoplesDialogComponent, {
      ...matDialogConfig,
      minWidth: 800,
      data: {
        title:
          this.translocoService.translateObject("component.invite_dialog.invite_peoples") +
          " " +
          this.translocoService.translateObject("component.invite_dialog.to") +
          " " +
          this.projectService.entityDetail()?.name,
        description: this.translocoService.translateObject("project.members.description_modal"),
      },
    });
    dialogRef.afterClosed().subscribe(async (invitationEmails: string[]) => {
      const selectedProject = this.projectService.entityDetail();
      if (selectedProject && invitationEmails.length) {
        await this.projectInvitationService.createBulkInvitations(
          selectedProject,
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
