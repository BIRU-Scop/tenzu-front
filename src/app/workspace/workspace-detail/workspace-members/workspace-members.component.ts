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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";

import { MatDialog } from "@angular/material/dialog";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.component";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { Role } from "@tenzu/repository/membership";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";

@Component({
  selector: "app-workspace-members",
  imports: [
    TranslocoDirective,
    MatIcon,
    FormsModule,
    TranslocoDirective,
    ReactiveFormsModule,
    MatTabLink,
    MatTabNav,
    RouterLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    HasPermissionDirective,
    NgTemplateOutlet,
    ButtonAddComponent,
  ],
  template: `
    @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <div class="flex flex-col gap-y-8 h-full" *transloco="let t">
        <div class="flex flex-row">
          <h1 class="mat-headline-medium grow">{{ t("workspace.members.title") }}</h1>
          <app-button-add
            *appHasPermission="{
              actualEntity: workspace,
              requiredPermission: WorkspacePermissions.CREATE_MODIFY_MEMBER,
            }"
            level="primary"
            translocoKey="workspace.members.invite_to_workspace"
            (click)="openInviteDialog()"
          />
        </div>
        <nav mat-tab-nav-bar [mat-stretch-tabs]="false" class="flex flex-row gap-x-4" [tabPanel]="tabPanel">
          @for (link of links; track link.path) {
            <ng-template #RouterContent>
              <a
                mat-tab-link
                [routerLink]="link.path"
                routerLinkActive
                #RouterLinkActive="routerLinkActive"
                [active]="RouterLinkActive.isActive"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <mat-icon class="icon-sm mr-1">{{ link.iconName }}</mat-icon
                >{{ t(link.labelKey) }}
              </a>
            </ng-template>
            @if (link.permission) {
              <ng-container *appHasPermission="{ requiredPermission: link.permission, actualEntity: workspace }">
                <ng-template [ngTemplateOutlet]="RouterContent"></ng-template>
              </ng-container>
            } @else {
              <ng-template [ngTemplateOutlet]="RouterContent"></ng-template>
            }
          }
        </nav>
        <div>
          <mat-tab-nav-panel #tabPanel><router-outlet /></mat-tab-nav-panel>
        </div>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceMembersComponent implements AfterViewInit {
  links = [
    {
      path: "./list-workspace-members",
      labelKey: "workspace.members.members_tab",
      iconName: "group",
      permission: null,
    },
    {
      path: "./list-workspace-invitations",
      labelKey: "workspace.members.invitation_tab",
      iconName: "schedule",
      permission: WorkspacePermissions.CREATE_MODIFY_MEMBER,
    },
  ];

  protected readonly WorkspacePermissions = WorkspacePermissions;

  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);
  workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  translocoService = inject(TranslocoService);
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  ngAfterViewInit(): void {
    this.breadcrumbStore.setPathComponent("workspaceMembers");
  }

  public openInviteDialog(): void {
    const selectedWorkspace = this.workspaceRepositoryService.entityDetail();
    if (selectedWorkspace) {
      this.workspaceInvitationRepositoryService.listWorkspaceInvitations(selectedWorkspace.id).then();
      const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
        ...matDialogConfig,
        minWidth: 850,
        data: {
          title: this.translocoService.translate("component.invite_dialog.invite_people_to", {
            name: selectedWorkspace.name,
          }),
          description: this.translocoService.translate("workspace.members.description_modal"),
          existingMembers: this.workspaceMembershipRepositoryService.members,
          existingInvitations: this.workspaceInvitationRepositoryService.entities,
          itemType: "workspace",
          userRole: selectedWorkspace.userRole,
        },
      });
      dialogRef.afterClosed().subscribe(async (invitations: { email: string; roleId: Role["id"] }[] | undefined) => {
        if (invitations?.length) {
          await this.workspaceInvitationRepositoryService.createBulkInvitations(
            selectedWorkspace,
            invitations.map(({ email, roleId }) => ({ email, roleId })),
          );
          await this.router.navigate(["list-workspace-invitations"], { relativeTo: this.activatedRoute });
        }
      });
    }
  }
}
