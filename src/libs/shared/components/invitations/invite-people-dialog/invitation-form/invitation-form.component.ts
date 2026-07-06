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

import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from "@angular/core";
import { InvitationFormRowComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/invitation-form-row/invitation-form-row.component";
import { ItemType } from "@tenzu/repository/base/misc.model";
import { InvitePeopleStore } from "../invite-people.store";

@Component({
  selector: "app-invitation-form",
  imports: [InvitationFormRowComponent],
  template: `
    @for (emailRow of store.peopleEmailsForm.emailRows; track $index) {
      <app-invitation-form-row
        [userRole]="store.userRole()"
        [itemType]="itemType()"
        [notAcceptedInvitationEmails]="store.notAcceptedInvitationEmails()"
        [emailRow]="emailRow"
        (removeRow)="store.removeRow($index)"
      />
    }
  `,
  styles: ``,
  host: { class: "flex flex-col py-4 gap-2" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationFormComponent {
  protected store = inject(InvitePeopleStore);
  itemType = input.required<ItemType>();

  constructor() {
    effect(() => {
      const rowCount = this.store.emailRowsModel().emailRows.length;
      untracked(() => {
        if (!rowCount) {
          return;
        }
        for (const row of this.store.peopleEmailsForm.emailRows) {
          row.emailGroup.email().markAsTouched();
          row.emailGroup.resendExisting().markAsTouched();
        }
      });
    });
  }
}
