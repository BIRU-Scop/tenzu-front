/*
 * Copyright (C) 2025-2026 BIRU
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
import { InvitationBase, InvitationStatus } from "@tenzu/repository/membership";
import { MatTooltip } from "@angular/material/tooltip";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectDetail } from "@tenzu/repository/project";
import { WorkspaceDetail } from "@tenzu/repository/workspace";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { LowerCasePipe } from "@angular/common";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";

@Component({
  selector: "app-invitation-actions",
  imports: [ConfirmDirective, MatTooltip, TranslocoDirective, LowerCasePipe, ButtonComponent, ButtonDeleteComponent],
  template: `
    @let _invitation = invitation();
    @if (_invitation.status === InvitationStatus.PENDING) {
      <ng-container *transloco="let t">
        @if (resentInvitation()) {
          <app-button
            type="button"
            [disabled]="true"
            level="secondary"
            iconName="mail"
            translocoKey="component.invitation.resent_confirmation"
          />
        } @else {
          @let _invitationResendDisableMessage = invitationResendDisableMessage();
          <div
            [matTooltip]="
              _invitationResendDisableMessage ? t(_invitationResendDisableMessage, { email: _invitation.email }) : ''
            "
            [matTooltipDisabled]="!_invitationResendDisableMessage"
          >
            <app-button
              type="button"
              [disabled]="!!_invitationResendDisableMessage"
              level="primary"
              iconName="mail"
              translocoKey="component.invitation.resend"
              (click)="resend.emit(_invitation.id)"
            />
          </div>
        }

        @if (notOwnerInvitationOrHasOwnerPermission()) {
          <app-button-delete
            translocoKey="component.invitation.revoke"
            [iconOnly]="true"
            appConfirm
            [data]="{
              deleteAction: true,
              actionButtonContent: t('component.invitation.confirm_revoke_action'),
              message: t('component.invitation.confirm_revoke_message', {
                email: _invitation.email,
                name: item().name,
                item: (itemType() === 'project' ? t('commons.project') : t('commons.workspace')) | lowercase,
              }),
            }"
            (popupConfirm)="revoke.emit(_invitation.id)"
          />
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

  projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);

  invitation = input.required<InvitationBase>();
  itemType = input.required<"project" | "workspace">();
  item = input.required<ProjectDetail | WorkspaceDetail>();
  resentInvitation = input.required<boolean>();

  resend = output<InvitationBase["id"]>();
  revoke = output<InvitationBase["id"]>();

  notOwnerInvitationOrHasOwnerPermission = computed(() => {
    let roleRepositoryService: ProjectRoleRepositoryService | WorkspaceRoleRepositoryService;
    const invitation = this.invitation();
    if (!invitation.roleId) {
      return false;
    }
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
    return !roleRepositoryService.entityMapSummary()[invitation.roleId]?.isOwner || !!this.item().userRole?.isOwner;
  });
  invitationResendDisableMessage = computed(() => {
    const invitation = this.invitation();
    if (invitation.numEmailsSent >= 100) {
      return "component.invitation.resend_too_much";
    }
    const lastSentAt = new Date(invitation.resentAt || invitation.createdAt);
    const now = new Date();
    if (Math.round((now.getTime() - lastSentAt.getTime()) / 1000 / 60) <= 10) {
      return "component.invitation.resend_too_soon";
    }
    return null;
  });
}
