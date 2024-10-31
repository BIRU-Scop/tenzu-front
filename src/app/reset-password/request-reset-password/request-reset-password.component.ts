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
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField } from "@angular/material/form-field";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { UserStore } from "@tenzu/data/user";

@Component({
  selector: "app-request-reset-password",
  standalone: true,
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatButton,
    MatError,
    MatFormField,
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
  ],
  host: {
    class: "grow",
  },
  template: `
    <div *transloco="let t; prefix: 'resetPassword'" class="h-full flex flex-col justify-center">
      <main class="basis-11/12">
        <div class="grid grid-cols-1 place-items-center place-content-center gap-y-4">
          <h1 class="mat-headline-medium">
            {{ t(!showConfirmation() ? "title" : "confirm.title") }}
          </h1>
          @if (!showConfirmation()) {
            <p class="mat-body-medium">
              {{ t("subtitle") }}
            </p>
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
              <app-email-field formControlName="email"></app-email-field>
              <button data-testid="submitCreateAccount-button" mat-flat-button class="primary-button" type="submit">
                {{ t("submit") }}
              </button>
            </form>
          } @else {
            <div class="max-w-2xl flex flex-col items-center gap-y-4">
              <p class="mat-body-medium text-center">
                {{ t("confirm.subtitle") }}
              </p>
              <p class="mat-body-large font-bold">{{ form.value.email }}</p>
              <button mat-stroked-button class="primary-button" [routerLink]="['/login']" type="button">
                {{ t("confirm.back") }}
              </button>
            </div>
          }
        </div>
      </main>
      <footer class="text-center">
        @if (!showConfirmation()) {
          <p class="mat-body-medium">
            {{ t("remember_the_password") }} <a [routerLink]="['/login']">{{ t("go_back") }}</a>
          </p>
        } @else {
          <p class="mat-body-medium">
            {{ t("confirm.new_email") }} <a [routerLink]="['/signup']">{{ t("confirm.create_account") }}</a>
          </p>
        }
      </footer>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestResetPasswordComponent {
  showConfirmation = model(false);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: ["", Validators.required],
  });
  userStore = inject(UserStore);
  async submit() {
    this.form.reset(this.form.value);
    if (this.form.value.email) {
      await this.userStore.requestResetPassword(this.form.value.email);
      this.showConfirmation.set(true);
    }
  }
}
