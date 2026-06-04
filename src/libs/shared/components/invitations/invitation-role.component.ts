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

import { Component, computed, effect, inject, input, signal } from "@angular/core";
import { InvitationBase, InvitationStatus, Role } from "@tenzu/repository/membership";
import { RoleSelectorFieldComponent } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.component";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { apply, disabled, form, FormField, required } from "@angular/forms/signals";
import { roleSelectorFieldSchema } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.schema";

@Component({
  selector: "app-invitation-role",
  imports: [RoleSelectorFieldComponent, FormField],
  template: `
    @if (roleControlForm().value()) {
      <app-role-selector-field
        [formField]="roleControlForm"
        [itemType]="itemType()"
        [userRole]="userRole()"
        (changed)="onRoleChanged($event)"
      />
    }
  `,
  styles: ``,
  host: {
    class: "w-full",
  },
})
export class InvitationRoleComponent {
  workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);

  invitation = input.required<InvitationBase>();
  itemType = input.required<"project" | "workspace">();
  userRole = input<Role>();
  invitationRepositoryService = computed(() => {
    switch (this.itemType()) {
      case "project": {
        return this.projectInvitationRepositoryService;
      }
      case "workspace": {
        return this.workspaceInvitationRepositoryService;
      }
    }
  });
  roleControlForm = form(signal<Role["id"] | null>(null), (path) => {
    required(path);
    disabled(path, () => this.invitation().status !== InvitationStatus.PENDING);
    apply(
      path,
      roleSelectorFieldSchema(() => this.userRole()),
    );
  });
  constructor() {
    effect(() => {
      const invitation = this.invitation();
      this.roleControlForm().reset(invitation.roleId);
    });
  }

  async onRoleChanged(value: Role["id"]) {
    await this.invitationRepositoryService().patchRequest(this.invitation().id, { roleId: value });
  }
}
