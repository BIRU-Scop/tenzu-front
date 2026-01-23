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

import { ChangeDetectionStrategy, Component, inject, model, signal } from "@angular/core";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { apply, FormField, form, submit } from "@angular/forms/signals";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { UserStore } from "@tenzu/repository/user";
import { MatDivider } from "@angular/material/divider";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { emailSchema } from "@tenzu/shared/components/form/email-field/schema";
import { trackFormValidationEffect } from "@tenzu/repository/auth/utils";

@Component({
  selector: "app-request-reset-password",
  imports: [
    EmailFieldComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslocoDirective,
    RouterLink,
    MatDivider,
    ButtonComponent,
    FormField,
  ],
  host: {
    class: "flex flex-col gap-4 w-96",
  },
  template: `
    <ng-container *transloco="let t">
      <h1 class="mat-headline-medium text-center">
        {{ t(!showConfirmation() ? "resetPassword.title" : "resetPassword.confirm.title") }}
      </h1>
      @if (!showConfirmation()) {
        <p class="mat-body-medium">
          {{ t("resetPassword.subtitle") }}
        </p>
        <form (submit)="submit($event)" class="flex flex-col gap-2">
          <app-email-field [formField]="resetForm.email"></app-email-field>
          <app-button translocoKey="resetPassword.submit" level="primary" type="submit" iconName="mail" />
        </form>
      } @else {
        <div class="max-w-2xl flex flex-col gap-y-4 items-center">
          <p class="mat-body-medium text-center">
            {{ t("resetPassword.confirm.subtitle") }}
          </p>
          <p class="mat-body-large font-bold">{{ resetForm.email().value() }}</p>
          <app-button
            iconName="login"
            level="primary"
            translocoKey="resetPassword.confirm.back"
            class="w-fit"
            data-testid="goBackToLogin-button"
            [routerLink]="['/login']"
            type="button"
          />
        </div>
      }
      <mat-divider></mat-divider>
      <footer class="text-center">
        @if (!showConfirmation()) {
          <p class="mat-body-medium">
            {{ t("resetPassword.remember_the_password") }}
            <a [routerLink]="['/login']">{{ t("resetPassword.go_back") }}</a>
          </p>
        } @else {
          <p class="mat-body-medium">
            {{ t("resetPassword.confirm.new_email") }}
            <a [routerLink]="['/signup']">{{ t("resetPassword.confirm.create_account") }}</a>
          </p>
        }
      </footer>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RequestResetPasswordComponent {
  showConfirmation = model(false);

  resetForm = form(signal({ email: "" }), (schemaPath) => {
    apply(schemaPath.email, emailSchema);
  });
  userStore = inject(UserStore);
  constructor() {
    trackFormValidationEffect(this.resetForm);
  }

  async submit(event: Event) {
    event.preventDefault();
    await submit(this.resetForm, async (form) => {
      await this.userStore.requestResetPassword(form().value().email);
      this.showConfirmation.set(true);
    });
  }
}
