/*
 * Copyright (C) 2024 BIRU
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
import { BreadcrumbStore } from "@tenzu/data/breadcrumb/breadcrumb.store";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { matDialogConfig } from "@tenzu/utils";
import { MatDialog } from "@angular/material/dialog";
import { InvitePeoplesDialogComponent } from "@tenzu/shared/components/invite-peoples-dialog/invite-peoples-dialog.component";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { MembershipStore } from "@tenzu/data/membership";
import { MatList } from "@angular/material/list";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "app-workspace-people",
  imports: [TranslocoDirective, MatButton, MatIcon, MatList, MatTabGroup, MatTab, UserCardComponent, MatTabLabel],
  template: `
    <div class="flex flex-col gap-y-8 h-full" *transloco="let t; prefix: 'workspace.people'">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("title") }}</h1>
        <button (click)="openInviteDialog()" class="tertiary-button" mat-stroked-button>
          {{ t("invite_to_workspace") }}
        </button>
      </div>
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" mat-stretch-tabs="false" mat-align-tabs="start">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">group</mat-icon>
            {{ t("members_tab") }}
          </ng-template>
          <p class="mat-body-medium text-neutral-20 mb-2">{{ t("members_description") }}</p>
          @if (membershipStore.workspaceEntities().length > 0) {
            <mat-list>
              @for (guest of membershipStore.workspaceEntities(); track guest.user.username) {
                <app-user-card
                  [fullName]="guest.user.fullName"
                  [username]="guest.user.username"
                  [color]="guest.user.color"
                ></app-user-card>
              }
            </mat-list>
          }
        </mat-tab>
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">schedule</mat-icon>
            {{ t("pending_tab") }}
          </ng-template>
          @if (membershipStore.workspaceInvitationsEntities().length > 0) {
            <mat-list [@newItemsFlyIn]="membershipStore.workspaceInvitationsEntities().length">
              @for (pendingMember of membershipStore.workspaceInvitationsEntities(); track pendingMember.id) {
                <app-user-card [fullName]="pendingMember.email!"></app-user-card>
              }
            </mat-list>
          } @else {
            <p class="mat-body-medium text-neutral-60">{{ t("pending_empty") }}</p>
          }
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="icon-sm mr-1">eyeglasses</mat-icon>
            {{ t("guests_tab") }}
          </ng-template>
          @if (membershipStore.workspaceGuestsEntities().length > 0) {
            <p class="mat-body-medium text-neutral-20 mb-2">{{ t("guest_description") }}</p>
            <mat-list>
              @for (member of membershipStore.workspaceGuestsEntities(); track member.user.username) {
                <app-user-card
                  [fullName]="member.user.fullName"
                  [username]="member.user.username"
                  [color]="member.user.color"
                ></app-user-card>
              }
            </mat-list>
          } @else {
            <p class="mat-body-medium text-neutral-40">{{ t("guest_empty") }}</p>
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
export class WorkspacePeopleComponent {
  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  workspaceStore = inject(WorkspaceStore);
  translocoService = inject(TranslocoService);
  membershipStore = inject(MembershipStore);

  selectedTabIndex = model(0);

  constructor() {
    this.breadcrumbStore.setThirdLevel({
      label: "workspace.general_title.workspacePeople",
      link: "",
      doTranslation: true,
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
          this.workspaceStore.selectedEntity()?.name,
        description: this.translocoService.translate("workspace.people.description_modal"),
      },
    });
    dialogRef.afterClosed().subscribe(async (invitationsMail: string[]) => {
      const selectedWorkspace = this.workspaceStore.selectedEntity();
      if (selectedWorkspace) {
        await this.membershipStore.sendWorkspaceInvitations(selectedWorkspace.id, invitationsMail);
        this.selectedTabIndex.set(1);
      }
    });
  }
}
