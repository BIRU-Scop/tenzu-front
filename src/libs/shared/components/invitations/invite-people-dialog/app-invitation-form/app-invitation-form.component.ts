/*
 * Copyright (C) 2026 BIRU
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

import { ChangeDetectionStrategy, Component, effect, input, model, output, untracked } from "@angular/core";
import { apply, applyEach, email, form, required, validate } from "@angular/forms/signals";
import { roleSelectorFieldSchema } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.schema";
import { Role } from "@tenzu/repository/membership";
import { PeopleEmailRow } from "../invite-people-dialog.type";
import { InvitationFormRowComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invitation-form-row/invitation-form-row.component";
import { ItemType } from "@tenzu/repository/base/misc.model";

@Component({
  selector: "app-invitation-form",
  imports: [InvitationFormRowComponent],
  template: `
    @for (emailRow of peopleEmailsForm.emailRows; track $index) {
      <app-invitation-form-row
        [userRole]="userRole()"
        [itemType]="itemType()"
        [notAcceptedInvitationEmails]="notAcceptedInvitationEmails()"
        [emailRow]="emailRow"
        (removeRow)="removeFromPeopleList($index)"
      />
    }
  `,
  styles: ``,
  host: { class: "flex flex-col py-4 gap-2" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInvitationFormComponent {
  peopleEmailsModel = model<{ emailRows: PeopleEmailRow[] }>({ emailRows: [] });
  memberEmails = input.required<string[]>();
  notAcceptedInvitationEmails = input.required<string[]>();
  itemType = input.required<ItemType>();
  userRole = input.required<Role | undefined>();
  peopleEmailsFormInvalid = output<boolean>();

  peopleEmailsForm = form(this.peopleEmailsModel, (path) => {
    applyEach(path.emailRows, (item) => {
      required(item.emailGroup.email, { message: "component.email.errors.required" });
      email(item.emailGroup.email, { message: "component.email.errors.email" });
      apply(
        item.roleId,
        roleSelectorFieldSchema(() => this.userRole()),
      );
      validate(item.emailGroup.email, ({ value }) => {
        return this.memberEmails().includes(value())
          ? { kind: "memberExists", message: "component.invite_dialog.member_error", path: item.emailGroup }
          : null;
      });
      validate(item.emailGroup.email, ({ value, valueOf }) => {
        if (this.notAcceptedInvitationEmails().includes(value()) && !valueOf(item.emailGroup.resendExisting)) {
          return {
            kind: "alreadyInvited",
            message: "component.invite_dialog.duplicate_error",
            path: item.emailGroup,
          };
        }
        return null;
      });
    });
  });

  constructor() {
    // effect(() => {
    //   for (const row of this.peopleEmailsForm.emailRows) {
    //     row.emailGroup.email().markAsTouched();
    //     row.emailGroup.resendExisting().markAsTouched();
    //   }
    // });
    effect(() => {
      const invalid = this.peopleEmailsForm().invalid();
      untracked(() => this.peopleEmailsFormInvalid.emit(invalid));
    });
  }
  removeFromPeopleList(index: number) {
    this.peopleEmailsModel.update((rows) => ({
      emailRows: rows.emailRows.filter((_, i) => i !== index),
    }));
  }
}
