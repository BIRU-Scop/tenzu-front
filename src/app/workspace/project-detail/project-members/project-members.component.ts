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

@Component({
  selector: "app-project-members",
  imports: [TranslocoDirective, MatButton, MatList, MatTabGroup, MatTab, MatTabLabel, UserCardComponent, MatIcon],
  template: `
    <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'project.members'">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("title") }}</h1>

        <button (click)="openCreateDialog()" class="tertiary-button" mat-stroked-button>
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
        <mat-tab [label]="t('pending_tab')">
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">schedule</mat-icon>
            {{ t("pending_tab") }}
          </ng-template>
          @let projectInvitations = projectInvitationService.entities();
          @if (projectInvitations.length > 0) {
            <mat-list [@newItemsFlyIn]="projectInvitations.length">
              @for (pendingMember of projectInvitations; track pendingMember.id) {
                <app-user-card [fullName]="pendingMember.email!"></app-user-card>
              }
            </mat-list>
          } @else {
            <p class="mat-body-medium text-on-surface-variant">{{ t("pending_empty") }}</p>
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
  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  projectService = inject(ProjectRepositoryService);
  projectInvitationService = inject(ProjectInvitationRepositoryService);
  projectMembershipService = inject(ProjectMembershipRepositoryService);
  translocoService = inject(TranslocoService);

  selectedTabIndex = model(0);

  constructor() {
    this.breadcrumbStore.setFifthLevel({
      label: "workspace.general_title.projectMembers",
      link: "",
      doTranslation: true,
    });
    this.breadcrumbStore.setSixthLevel(undefined);
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
