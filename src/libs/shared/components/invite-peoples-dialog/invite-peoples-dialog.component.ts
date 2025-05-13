/*
 * Copyright (C) 2024-2025 BIRU
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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";

export interface InvitePeopleDialogData {
  title: string;
  description: string;
}

@Component({
  selector: "app-invite-peoples-dialog",
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatDivider,
    MatIcon,
    MatFormField,
    MatInput,
    MatIconButton,
    FormsModule,
    ReactiveFormsModule,
    MatLabel,
    EmailFieldComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 id="aria-label" mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <div [innerHTML]="data.description"></div>
          <form [formGroup]="form" (ngSubmit)="addToPeopleList()">
            <div class="flex flex-row gap-x-4 items-center">
              <mat-icon class="icon-lg">group_add</mat-icon>
              <mat-form-field>
                <mat-label>
                  {{ t("component.invite_dialog.mailing_list") }}
                </mat-label>
                <input
                  matInput
                  placeholder="name1@amazing.com,sheepAreGreat@tenzu.sh,tenzu@missing.com"
                  class="w-fit grow"
                  formControlName="emailsToAdd"
                />
              </mat-form-field>
              <button mat-flat-button class="primary-button" type="submit">
                {{ t("component.invite_dialog.add") }}
              </button>
            </div>
            <mat-divider></mat-divider>
            <div class="flex flex-col gap-y-4 px-12 py-4" formArrayName="peopleEmails">
              @for (peopleEmail of peopleEmails.controls; track peopleEmail) {
                <div class="flex flex-row gap-x-4">
                  <app-email-field [formControlName]="$index" [displayLabel]="false" class="grow" />
                  <button mat-icon-button class="icon-md primary-button" (click)="removeFromPeopleList($index)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
            </div>
            <mat-divider></mat-divider>
          </form>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        @let _peopleEmails = peopleEmails;
        <button mat-flat-button mat-dialog-close class="secondary-button">Cancel</button>
        <button
          mat-flat-button
          class="tertiary-button"
          [mat-dialog-close]="_peopleEmails.value"
          [disabled]="!_peopleEmails.value.length || !_peopleEmails.valid"
        >
          {{ t("component.invite_dialog.invite_peoples") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitePeoplesDialogComponent {
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    emailsToAdd: [""],
    peopleEmails: this.fb.array([]),
  });
  data = inject<InvitePeopleDialogData>(MAT_DIALOG_DATA);

  addToPeopleList() {
    const emailsToAdd = this.form.controls["emailsToAdd"];
    emailsToAdd.updateValueAndValidity();
    if (emailsToAdd.valid && emailsToAdd.value) {
      emailsToAdd.value.split(",").forEach((value) => {
        if (value && !this.peopleEmails.value.includes(value)) {
          const emailControl = new FormControl(value, [Validators.email, Validators.required]);
          emailControl.updateValueAndValidity({ onlySelf: true });
          this.peopleEmails.push(emailControl);
        }
      });
      emailsToAdd.reset();
    }
  }

  get peopleEmails() {
    return this.form.controls["peopleEmails"] as FormArray;
  }

  removeFromPeopleList(index: number) {
    this.peopleEmails.removeAt(index);
  }
}
