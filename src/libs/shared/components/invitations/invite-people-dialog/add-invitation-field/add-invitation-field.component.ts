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

import { Component, output, signal } from "@angular/core";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { form, FormField, required } from "@angular/forms/signals";

@Component({
  selector: "app-add-invitation-field",
  imports: [ButtonAddComponent, MatFormField, MatIcon, MatInput, MatLabel, TranslocoDirective, FormField],
  template: `
    <div class="flex flex-row gap-4 place-items-center" *transloco="let t">
      <mat-icon> group_add</mat-icon>
      <mat-form-field class="flex grow" subscriptSizing="dynamic">
        <mat-label>{{ t("component.invite_dialog.mailing_list") }}</mat-label>
        <input matInput class="w-fit grow" [formField]="addEmailsForm.emails" />
      </mat-form-field>
      <app-button-add [disabled]="addEmailsForm().invalid()" (click)="emitValue()" />
    </div>
  `,
  styles: ``,
})
export class AddInvitationFieldComponent {
  peopleEmails = output<string>();
  addEmailsForm = form(signal({ emails: "" }), (path) => {
    required(path.emails, { message: "form_errors.required" });
  });
  emitValue() {
    const value = this.addEmailsForm().value().emails.trim();
    this.peopleEmails.emit(value);
    this.addEmailsForm().reset({ emails: "" });
  }
}
