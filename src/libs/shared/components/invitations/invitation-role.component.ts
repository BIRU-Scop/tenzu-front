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

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InvitationBase, InvitationStatus, Role } from "@tenzu/repository/membership";
import { RoleSelectorFieldComponent } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.component";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";

@Component({
  selector: "app-invitation-role",
  imports: [FormsModule, RoleSelectorFieldComponent, ReactiveFormsModule],
  template: `
    @if (roleControl.value) {
      <app-role-selector-field [formControl]="roleControl" [itemType]="itemType()" [userRole]="userRole()" />
    }
  `,
  styles: ``,
  host: {
    class: "w-full",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationRoleComponent implements OnInit {
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
  roleControl = new FormControl<Role["id"] | null>(null, { validators: [Validators.required] });

  constructor() {
    effect(() => {
      const invitation = this.invitation();
      this.roleControl.reset(
        { value: invitation.roleId, disabled: invitation.status !== InvitationStatus.PENDING },
        { onlySelf: true, emitEvent: false },
      );
    });
  }

  ngOnInit() {
    return this.roleControl.valueChanges.pipe(filterNotNull()).subscribe(async (value: Role["id"]) => {
      await this.invitationRepositoryService().patchRequest(this.invitation().id, { roleId: value });
    });
  }
}
