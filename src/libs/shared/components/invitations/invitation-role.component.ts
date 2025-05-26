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

import { ChangeDetectionStrategy, Component, input, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InvitationBase, InvitationStatus, Role } from "@tenzu/repository/membership";
import { RoleSelectorFieldComponent } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.component";

@Component({
  selector: "app-invitation-role",
  imports: [FormsModule, RoleSelectorFieldComponent, ReactiveFormsModule],
  template: `
    @if (roleControl) {
      <app-role-selector-field [formControl]="roleControl" [itemType]="itemType()" [userRole]="userRole()" />
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationRoleComponent implements OnInit {
  invitation = input.required<InvitationBase>();
  itemType = input.required<"project" | "workspace">();
  userRole = input<Role>();
  roleControl?: FormControl;

  ngOnInit() {
    const invitation = this.invitation();

    this.roleControl = new FormControl(
      { value: invitation.roleId, disabled: invitation.status !== InvitationStatus.PENDING },
      { validators: [Validators.required] },
    );

    this.roleControl.valueChanges.subscribe(() => {
      // TODO
    });
  }
}
