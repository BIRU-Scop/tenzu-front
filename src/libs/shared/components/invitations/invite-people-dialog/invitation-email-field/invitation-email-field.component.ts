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

import { ChangeDetectionStrategy, Component, input, output, Pipe, PipeTransform } from "@angular/core";
import { MatInput } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField } from "@angular/material/form-field";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatOption } from "@angular/material/core";
import { ButtonCloseComponent } from "src/libs/shared/components/ui/button/button-close.component";
import { MatSelect } from "@angular/material/select";
import { FieldTree, FormField } from "@angular/forms/signals";
import {
  InvitePeopleDialogData,
  PeopleEmailRow,
} from "src/libs/shared/components/invitations/invite-people-dialog/invite-people-dialog.type";
import { Role } from "src/libs/repository/membership";
import { MatTooltip } from "@angular/material/tooltip";

const ROLE_TOOLTIPS: Record<"project" | "workspace", Record<Role["slug"], string>> = {
  workspace: {
    owner: "component.role_selector.workspace.owner",
    admin: "component.role_selector.workspace.admin",
    member: "component.role_selector.workspace.member",
    "readonly-member": "component.role_selector.workspace.readonly_member",
  },
  project: {
    owner: "component.role_selector.project.owner",
    admin: "component.role_selector.project.admin",
    "readonly-member": "component.role_selector.project.readonly_member",
  },
};

@Pipe({
  name: "alreadyInvited",
})
export class AlreadyInvitedPipe implements PipeTransform {
  transform(value: string, existingInvitations: string[]): boolean {
    return existingInvitations.includes(value);
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatInput,
    ReactiveFormsModule,
    TranslocoDirective,
    MatFormField,
    MatError,
    MatCheckbox,
    AlreadyInvitedPipe,
    ButtonCloseComponent,
    MatOption,
    MatSelect,
    FormField,
    MatTooltip,
  ],
  selector: "app-invitation-email-field",
  styles: ``,
  template: `
    @let _emailRow = emailRow();
    <div class="flex flex-row gap-x-4 items-start" *transloco="let t">
      <div class="flex flex-col grow min-w-0 basis-0">
        <mat-form-field subscriptSizing="dynamic">
          <input matInput type="email" autocomplete="email" [formField]="_emailRow.emailGroup.email" />
          @let visibleErrors = _emailRow.emailGroup.email().errors().filter(e => e.kind !== "alreadyInvited");
          @if (
            _emailRow.emailGroup.email().touched() && _emailRow.emailGroup.email().invalid() && visibleErrors.length > 0
          ) {
            <mat-error>
              @for (error of _emailRow.emailGroup.email().errors(); track error.kind) {
                @if (error.kind !== "alreadyInvited") {
                  {{ t(error.message || "") }}
                }
              }
            </mat-error>
          }
        </mat-form-field>

        @if (_emailRow.emailGroup.email().value() | alreadyInvited: notAcceptedInvitationEmails()) {
          <div
            class="flex items-center gap-x-2 px-3 text-xs"
            [class.mat-text-error]="_emailRow.emailGroup.email().invalid()"
          >
            <span class="text-nowrap">{{ t("component.invite_dialog.duplicate_error") }}</span>
            <mat-checkbox
              [formField]="_emailRow.emailGroup.resendExisting"
              class="mx-0"
              [class.checkbox-invalid]="_emailRow.emailGroup.email().invalid()"
            >
              {{ t("component.invite_dialog.duplicate_error_ok") }}
            </mat-checkbox>
          </div>
        }
      </div>
      <mat-form-field subscriptSizing="dynamic">
        <mat-select [formField]="_emailRow.roleId">
          @for (role of availableRoles(); track role.id) {
            @let tooltipKey = ROLE_TOOLTIPS[data().itemType][role.slug];
            <mat-option
              [value]="role.id"
              [matTooltip]="tooltipKey ? t(tooltipKey) : ''"
              [matTooltipDisabled]="!tooltipKey"
              matTooltipPosition="after"
            >
              {{ role.name }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
      <app-button-close class="mt-2" iconSize="sm" (click)="removeRow.emit()" [iconOnly]="true" />
    </div>
  `,
})
export class InvitationEmailFieldComponent {
  data = input.required<InvitePeopleDialogData>();
  notAcceptedInvitationEmails = input.required<string[]>();
  availableRoles = input.required<Role[]>();
  emailRow = input.required<FieldTree<PeopleEmailRow, number>>();
  protected readonly ROLE_TOOLTIPS = ROLE_TOOLTIPS;
  removeRow = output<void>();
}
