/*
 * Copyright (C) 2025 BIRU
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

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { MatButton, MatIconButton } from "@angular/material/button";
import { InvitationBase, InvitationStatus } from "@tenzu/repository/membership";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectDetail } from "@tenzu/repository/project";
import { WorkspaceDetail } from "@tenzu/repository/workspace";
import { WorkspaceRolesRepositoryService } from "@tenzu/repository/workspace-roles";
import { ProjectRolesRepositoryService } from "@tenzu/repository/project-roles";

@Component({
  selector: "app-invitation-actions",
  imports: [ConfirmDirective, MatButton, MatIcon, MatIconButton, MatTooltip, TranslocoDirective],
  template: `
    @let _invitation = invitation();
    @if (_invitation.status === InvitationStatus.PENDING) {
      <ng-container *transloco="let t">
        @if (resentInvitation()) {
          <button type="button" disabled class="secondary-button" mat-flat-button>
            {{ t("component.invitation.resent_confirmation") }}
          </button>
        } @else {
          @let invitationResendDisableMessage = getInvitationResendDisableMessage(_invitation);
          <div
            [matTooltip]="
              invitationResendDisableMessage ? t(invitationResendDisableMessage, { email: _invitation.email }) : ''
            "
            [matTooltipDisabled]="!invitationResendDisableMessage"
          >
            <button
              type="button"
              [disabled]="!!invitationResendDisableMessage"
              (click)="resend.emit(_invitation.id)"
              class="secondary-button"
              mat-stroked-button
            >
              {{ t("component.invitation.resend") }}
            </button>
          </div>
        }

        @if (notOwnerInvitationOrHasOwnerPermission()) {
          <button
            type="button"
            mat-icon-button
            [attr.aria-label]="t('component.invitation.revoke')"
            [matTooltip]="t('component.invitation.revoke')"
            appConfirm
            [data]="{
              deleteAction: true,
              actionButtonContent: t('component.invitation.confirm_revoke_action'),
              message: t('component.invitation.confirm_revoke_message', {
                email: _invitation.email,
                name: item().name,
                item: itemType(),
              }),
            }"
            (popupConfirm)="revoke.emit(_invitation.id)"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </ng-container>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex gap-2",
  },
})
export class InvitationActionsComponent {
  protected readonly InvitationStatus = InvitationStatus;

  projectRoleRepositoryService = inject(ProjectRolesRepositoryService);
  workspaceRoleRepositoryService = inject(WorkspaceRolesRepositoryService);

  invitation = input.required<InvitationBase>();
  itemType = input.required<"project" | "workspace">();
  item = input.required<ProjectDetail | WorkspaceDetail>();
  resentInvitation = input.required<boolean>();
  resend = output<InvitationBase["id"]>();
  revoke = output<InvitationBase["id"]>();

  notOwnerInvitationOrHasOwnerPermission = computed(() => {
    let roleRepositoryService: ProjectRolesRepositoryService | WorkspaceRolesRepositoryService;
    switch (this.itemType()) {
      case "project": {
        roleRepositoryService = this.projectRoleRepositoryService;
        break;
      }
      case "workspace": {
        roleRepositoryService = this.workspaceRoleRepositoryService;
        break;
      }
    }
    return !roleRepositoryService.entityMapSummary()[this.invitation().roleId].isOwner || this.item().userRole?.isOwner;
  });

  getInvitationResendDisableMessage(invitation: InvitationBase): string | null {
    if (invitation.numEmailsSent >= 100) {
      return "component.invitation.resend_too_much";
    }
    const lastSentAt = new Date(invitation.resentAt || invitation.createdAt);
    const now = new Date();
    if (Math.round((now.getTime() - lastSentAt.getTime()) / 1000 / 60) <= 10) {
      return "component.invitation.resend_too_soon";
    }
    return null;
  }
}
