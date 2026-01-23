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
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { apply, form, required, submit, validate } from "@angular/forms/signals";
import { TranslocoDirective } from "@jsverse/transloco";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, UserStore } from "@tenzu/repository/user";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "@tenzu/repository/auth";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { PasswordFieldComponent, passwordSchema } from "@tenzu/shared/components/form/password-field";
import { lastValueFrom } from "rxjs";
import { trackFormValidationEffect } from "@tenzu/repository/auth/utils";

@Component({
  selector: "app-reset-password-form",
  imports: [FormsModule, ReactiveFormsModule, TranslocoDirective, ButtonComponent, PasswordFieldComponent],
  host: {
    class: "flex flex-col gap-y-4",
  },
  template: `
    <ng-container *transloco="let t">
      <h1 class="mat-headline-medium">
        {{ t("resetPassword.choose_new_password") }}
      </h1>
      <form (submit)="submit($event)" class="flex flex-col gap-8">
        <app-password-field
          class="flex"
          [formField]="resetPasswordForm.newPassword"
          label="resetPassword.new_password"
          [settings]="{
            enabledStrength: true,
          }"
        />
        <app-password-field
          class="flex"
          [formField]="resetPasswordForm.repeatPassword"
          label="resetPassword.repeat_password"
        />
        <app-button
          level="primary"
          type="submit"
          translocoKey="resetPassword.change_password"
          [disabled]="resetPasswordForm().invalid()"
        />
      </form>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordFormComponent {
  userService = inject(UserService);
  userStore = inject(UserStore);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  passwordModel = signal({ newPassword: "", repeatPassword: "" });
  resetPasswordForm = form(this.passwordModel, (schemaPath) => {
    apply(schemaPath.newPassword, passwordSchema({ enabledStrength: true }));
    required(schemaPath.repeatPassword);
    validate(schemaPath.repeatPassword, (context) => {
      const password = context.valueOf(schemaPath.newPassword);
      const repeatPassword = context.value();
      return password && repeatPassword && password !== repeatPassword
        ? {
            path: schemaPath.repeatPassword,
            kind: "passwordNotMatch",
            message: "resetPassword.password_not_match",
          }
        : undefined;
    });
  });

  token: string | null = "";
  token_expired = model(false);

  constructor() {
    this.route.paramMap.subscribe((value) => {
      this.token = value.get("token");
      if (this.token) {
        this.userService.verifyResetTokenPassword(this.token).subscribe({
          error: (err: HttpErrorResponse) => {
            this.router.navigateByUrl("/reset-password").then();
            this.notificationService.error({
              title: "resetPassword.token_error." + err.error.error.detail,
              translocoTitle: true,
            });
            this.token_expired.set(true);
          },
          next: (value1) => {
            this.token_expired.set(!value1);
          },
        });
      }
    });
    trackFormValidationEffect(this.resetPasswordForm);
  }

  async submit(event: SubmitEvent) {
    event.preventDefault();
    await submit(this.resetPasswordForm, async (form) => {
      const values = form().value();
      if (this.token) {
        try {
          const value = await lastValueFrom(this.userService.resetPassword(this.token, values.newPassword));
          this.authService.setToken(value);
          this.userStore.getMe();
          this.router.navigateByUrl("/").then();
        } catch (err) {
          this.router.navigateByUrl("/reset-password").then();
          if (err instanceof HttpErrorResponse) {
            this.notificationService.error({
              title: "resetPassword.token_error." + err.error.error.detail,
              translocoTitle: true,
            });
          }
          this.token_expired.set(true);
        }
      }
    });
  }
}
