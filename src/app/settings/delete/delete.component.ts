/*
 * Copyright (C) 2024 BIRU
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

import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatButton } from "@angular/material/button";
import { DeleteAccountDialogComponent } from "./delete-account-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { MatDialog } from "@angular/material/dialog";
import { UserService, UserStore } from "@tenzu/data/user";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatError } from "@angular/material/form-field";
import { Router } from "@angular/router";

@Component({
  selector: "app-delete",
  template: `
    <div class="w-90 flex flex-col gap-y-8" *transloco="let t; prefix: 'settings.delete'">
      <h1 class="mat-headline-medium">{{ t("delete") }}</h1>
      <form [formGroup]="form" (ngSubmit)="confirmDialog()" class="flex flex-col gap-y-4">
        <p class="mat-body-medium text-neutral-20">{{ t("consequences.sorry") }} (ㅠ﹏ㅠ)</p>
        <p class="mat-body-medium text-neutral-20">{{ t("consequences.what") }}:</p>
        <ul class="pl-4">
          <li class="mat-body-medium text-neutral-20 list-disc">{{ t("consequences.item1") }}</li>
          <li class="mat-body-medium text-neutral-20 list-disc">{{ t("consequences.item2") }}</li>
          <li class="mat-body-medium text-neutral-20 list-disc">{{ t("consequences.item3") }}</li>
        </ul>
        <mat-checkbox formControlName="consent" required>
          <div class="flex flex-col">
            {{ t("consent") }}
            @if (submit() && form.controls.consent.hasError("required")) {
              <mat-error class="text-error-40">{{ t("confirm_consent") }}</mat-error>
            }
          </div>
        </mat-checkbox>
        <button type="submit" mat-flat-button class="error-button">
          {{ t("delete_account") }}
        </button>
      </form>
    </div>
  `,
  imports: [TranslocoDirective, MatCheckbox, MatButton, ReactiveFormsModule, MatError],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteComponent {
  readonly submit = model(false);

  userStore = inject(UserStore);
  userService = inject(UserService);
  readonly dialog = inject(MatDialog);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    consent: [false, Validators.required],
  });
  router = inject(Router);

  confirmDialog(): void {
    this.submit.set(true);
    if (this.form.value.consent) {
      this.userService.getDeleteInfo().subscribe((value) => {
        if (value.projects.length !== 0 || value.workspaces.length !== 0) {
          const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
            ...matDialogConfig,
            minWidth: 600,
            data: {
              workspaces: value.workspaces,
              projects: value.projects,
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.userStore.deleteUser();
            }
          });
        } else {
          this.userStore.deleteUser();
        }
      });
    }
  }
}
