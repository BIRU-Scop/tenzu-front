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
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { InvitePeopleDialogComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { MatIcon } from "@angular/material/icon";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { Role } from "@tenzu/repository/membership";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-project-members",
  imports: [
    TranslocoDirective,
    MatIcon,
    MatButton,
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
  ],
  template: `
    @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <div class="flex flex-col gap-y-8" *transloco="let t">
        <div class="flex flex-row">
          <h1 class="mat-headline-medium grow">{{ t("project.members.title") }}</h1>

          <button
            *appHasPermission="{ requiredPermission: ProjectPermissions.CREATE_MODIFY_MEMBER, actualEntity: project }"
            (click)="openInviteDialog()"
            class="tertiary-button"
            mat-stroked-button
          >
            {{ t("project.members.invite_to_project") }}
          </button>
        </div>
        <nav mat-tab-nav-bar [mat-stretch-tabs]="false" class="flex flex-row gap-x-4" [tabPanel]="tabPanel">
          @for (link of links; track link.path) {
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
export default class ProjectMembersComponent implements AfterViewInit {
  links = [
    { path: "./list-project-members", labelKey: "project.members.members_tab", iconName: "group" },
    { path: "./list-project-invitations", labelKey: "project.members.invitation_tab", iconName: "schedule" },
  ];
  protected readonly ProjectPermissions = ProjectPermissions;

  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  projectRepositoryService = inject(ProjectRepositoryService);
  projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  translocoService = inject(TranslocoService);
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  ngAfterViewInit(): void {
    this.breadcrumbStore.setPathComponent("projectMembers");
  }

  public openInviteDialog(): void {
    const selectedProject = this.projectRepositoryService.entityDetail();
    if (selectedProject) {
      this.projectInvitationRepositoryService.listProjectInvitations(selectedProject.id).then();
      const dialogRef = this.dialog.open(InvitePeopleDialogComponent, {
        ...matDialogConfig,
        minWidth: 850,
        data: {
          title: this.translocoService.translate("component.invite_dialog.invite_people_to", {
            name: selectedProject.name,
          }),
          description: this.translocoService.translateObject("project.members.description_modal"),
          existingMembers: this.projectMembershipRepositoryService.members,
          existingInvitations: this.projectInvitationRepositoryService.entities,
          itemType: "project",
          userRole: selectedProject.userRole,
        },
      });
      dialogRef.afterClosed().subscribe(async (invitations: { email: string; roleId: Role["id"] }[] | undefined) => {
        if (invitations?.length) {
          await this.projectInvitationRepositoryService.createBulkInvitations(
            selectedProject,
            invitations.map(({ email, roleId }) => ({ email, roleId })),
          );
          await this.router.navigate(["list-project-invitations"], { relativeTo: this.activatedRoute });
        }
      });
    }
  }
}
