/*
 * Copyright (C) 2024-2026 BIRU
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

import { Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";

import { InvitationStatus } from "@tenzu/repository/membership";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { AddInvitationFieldComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/add-invitation-field/add-invitation-field.component";
import {
  InvitePeopleDialogData,
  PeopleEmailRow,
} from "@tenzu/shared/components/invitations/invite-people-dialog/invite-people-dialog.type";
import { AppInvitationFormComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/app-invitation-form/app-invitation-form.component";

@Component({
  selector: "app-invite-people-dialog",
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDivider,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
    ButtonCloseComponent,
    ButtonComponent,
    AddInvitationFieldComponent,
    AppInvitationFormComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 id="aria-label" mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <div [innerHTML]="data.description"></div>
          @if (data.canAddEmails) {
            <app-add-invitation-field (peopleEmails)="addToPeopleList($event)" />
            <mat-divider />
          }
          @if (peopleEmailsModel().emailRows.length) {
            <app-invitation-form
              [userRole]="data.userRole"
              [itemType]="data.itemType"
              [memberEmails]="memberEmails()"
              [notAcceptedInvitationEmails]="notAcceptedInvitationEmails()"
              [(peopleEmailsModel)]="peopleEmailsModel"
              (peopleEmailsFormInvalid)="formInvalid.set($event)"
            />
            <mat-divider />
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <app-form-footer>
          <app-button-close appFormFooterSecondaryAction [mat-dialog-close]="undefined" />
          <app-button
            translocoKey="component.invite_dialog.invite_people"
            level="primary"
            iconName="mail"
            [mat-dialog-close]="submitValue()"
            [disabled]="!peopleEmailsModel().emailRows.length || formInvalid()"
          />
        </app-form-footer>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
})
export class InvitePeopleDialogComponent {
  data = inject<InvitePeopleDialogData>(MAT_DIALOG_DATA);
  formInvalid = signal<boolean>(true);
  memberEmails = computed(() => this.data.existingMembers().map((member) => member.email));
  notAcceptedInvitations = computed(() =>
    this.data.existingInvitations().filter((invitation) => invitation.status !== InvitationStatus.ACCEPTED),
  );
  notAcceptedInvitationEmails = computed(() => this.notAcceptedInvitations().map((invitation) => invitation.email));

  peopleEmailsModel = signal<{ emailRows: PeopleEmailRow[] }>({ emailRows: [] });

  submitValue = computed(() =>
    this.peopleEmailsModel().emailRows.map(({ emailGroup, roleId }) => ({ email: emailGroup.email, roleId })),
  );

  constructor() {
    effect(() => {
      const initialInvites = this.data.initialInvites; // TODO make it a signal using bindings
      if (initialInvites && initialInvites.length) {
        untracked(() => {
          this.peopleEmailsModel.update((value) => ({
            emailRows: [
              ...value.emailRows,
              ...initialInvites.map((initialInvite) => {
                return {
                  emailGroup: { email: initialInvite.email, resendExisting: false },
                  roleId: initialInvite.roleId,
                };
              }),
            ],
          }));
        });
      }
    });
  }

  addToPeopleList(raw: string) {
    const existing = this.peopleEmailsModel().emailRows;
    const notAccepted = this.notAcceptedInvitations();
    const newRows: PeopleEmailRow[] = [];
    raw.split(",").forEach((str) => {
      const value = str.trim();
      if (!value) return;
      if (existing.some((row) => row.emailGroup.email === value)) return;
      if (newRows.some((row) => row.emailGroup.email === value)) return;
      const existingInvitation = notAccepted.find((invitation) => invitation.email === value);
      newRows.push({
        emailGroup: { email: value, resendExisting: false },
        roleId: existingInvitation?.roleId ?? null,
      });
    });
    if (newRows.length) {
      this.peopleEmailsModel.update((value) => ({
        emailRows: [...value.emailRows, ...newRows],
      }));
      // for (const row of this.peopleEmailsForm.emailRows) {
      //   row.emailGroup.email().markAsTouched();
      //   row.emailGroup.resendExisting().markAsTouched();
      // }
    }
  }
}
