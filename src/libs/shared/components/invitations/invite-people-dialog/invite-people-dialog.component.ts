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

import { Component, effect, inject, input, untracked } from "@angular/core";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";

import { InvitationBase, Role } from "@tenzu/repository/membership";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { AddInvitationFieldComponent } from "@tenzu/shared/components/invitations/invite-people-dialog/add-invitation-field/add-invitation-field.component";
import { InvitationFormComponent } from "./invitation-form/invitation-form.component";
import { ProjectImportationPendingInvitationNested } from "@tenzu/repository/importation";
import { UserNested } from "@tenzu/repository/user";
import { ItemType } from "@tenzu/repository/base/misc.model";
import { InvitePeopleStore } from "./invite-people.store";

@Component({
  selector: "app-invite-people-dialog",
  providers: [InvitePeopleStore],
  imports: [
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
    InvitationFormComponent,
  ],
  template: `
    <ng-container>
      <h2 id="aria-label" mat-dialog-title>{{ title() }}</h2>
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <div [innerHTML]="description()"></div>
          @if (canAddEmails()) {
            <app-add-invitation-field (peopleEmails)="store.addEmails($event)" />
            <mat-divider />
          }
          <app-invitation-form [itemType]="itemType()" />
          @if (store.emailRowsModel().emailRows.length) {
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
            type="submit"
            [mat-dialog-close]="store.validValue()"
            [disabled]="store.formInvalid()"
          />
        </app-form-footer>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
})
export class InvitePeopleDialogComponent {
  title = input.required<string>();
  description = input.required<string>();
  canAddEmails = input.required<boolean>();
  initialInvites = input<ProjectImportationPendingInvitationNested[]>([]);
  existingMembers = input.required<UserNested[]>();
  existingInvitations = input.required<InvitationBase[]>();
  userRole = input.required<Role | undefined>();
  itemType = input.required<ItemType>();

  protected store = inject(InvitePeopleStore);

  constructor() {
    effect(() => this.store.setContext(this.existingMembers(), this.existingInvitations(), this.userRole()));
    effect(() => untracked(() => this.store.addInitialInvites(this.initialInvites())));
  }
}
