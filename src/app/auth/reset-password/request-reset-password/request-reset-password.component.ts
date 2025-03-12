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

import { ChangeDetectionStrategy, Component, inject, model, OnDestroy, OnInit } from "@angular/core";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { UserStore } from "@tenzu/repository/user";
import { MatDivider } from "@angular/material/divider";
import { AuthFormStateStore } from "../../auth-form-state.store";

@Component({
  selector: "app-request-reset-password",
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
    MatDivider,
  ],
  template: `
    <div *transloco="let t; prefix: 'resetPassword'" class="flex flex-col gap-y-5">
      <h1 class="mat-headline-medium text-center">
        {{ t(!showConfirmation() ? "title" : "confirm.title") }}
      </h1>
      @if (!showConfirmation()) {
        <p class="mat-body-medium">
          {{ t("subtitle") }}
        </p>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
          <app-email-field formControlName="email"></app-email-field>
          <button data-testid="submitResetPassword-button" mat-flat-button class="primary-button" type="submit">
            {{ t("submit") }}
          </button>
        </form>
      } @else {
        <div class="max-w-2xl flex flex-col gap-y-4 items-center">
          <p class="mat-body-medium text-center">
            {{ t("confirm.subtitle") }}
          </p>
          <p class="mat-body-large font-bold">{{ form.value.email }}</p>
          <button
            mat-stroked-button
            class="primary-button w-fit"
            data-testid="goBackToLogin-button"
            [routerLink]="['/login']"
            type="button"
          >
            {{ t("confirm.back") }}
          </button>
        </div>
      }
      <mat-divider></mat-divider>
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
export default class RequestResetPasswordComponent implements OnInit, OnDestroy {
  showConfirmation = model(false);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });
  userStore = inject(UserStore);
  readonly authFormStateStore = inject(AuthFormStateStore);

  ngOnInit(): void {
    this.authFormStateStore.updateHasError(this.form.events);
  }
  ngOnDestroy(): void {
    this.authFormStateStore.resetError();
  }

  async submit() {
    this.form.reset(this.form.value);
    if (this.form.value.email) {
      await this.userStore.requestResetPassword(this.form.value.email);
      this.showConfirmation.set(true);
    }
  }
}
