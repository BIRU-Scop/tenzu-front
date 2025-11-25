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
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { MatError } from "@angular/material/form-field";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, UserStore } from "@tenzu/repository/user";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService, Tokens } from "@tenzu/repository/auth";
import { NotificationService } from "@tenzu/utils/services/notification";
import { passwordsMustMatch } from "@tenzu/utils/validators";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";

@Component({
  selector: "app-reset-password-form",
  imports: [FormsModule, ReactiveFormsModule, TranslocoDirective, PasswordFieldComponent, MatError, ButtonComponent],
  template: `
    <div *transloco="let t" class="flex flex-col gap-y-4">
      <h1 class="mat-headline-medium">
        {{ t("choose_new_password") }}
      </h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-8">
        @if (form.hasError("passwordNotMatch")) {
          <mat-error class="mat-body-medium">
            {{ t("resetPassword.password_not_match") }}
          </mat-error>
        }
        <app-password-field
          class="flex"
          formControlName="newPassword"
          [settings]="{
            strength: { enabled: true, showBar: true },
            label: t('resetPassword.new_password'),
          }"
        ></app-password-field>
        <app-password-field
          class="flex"
          formControlName="repeatPassword"
          [settings]="{
            strength: { enabled: false },
            label: t('resetPassword.repeat_password'),
          }"
        >
        </app-password-field>
        <app-button
          level="primary"
          type="submit"
          translocoKey="resetPassword.change_password"
          [disabled]="form.invalid"
        />
      </form>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordFormComponent implements OnInit, OnDestroy {
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group(
    {
      newPassword: [""],
      repeatPassword: [""],
    },
    { validators: passwordsMustMatch },
  );
  token: string | null = "";
  token_expired = model(false);
  userService = inject(UserService);
  userStore = inject(UserStore);
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  readonly authConfigStore = inject(AuthConfigStore);

  constructor() {
    this.route.paramMap.subscribe((value) => {
      this.token = value.get("token");
      if (this.token) {
        this.userService.verifyResetTokenPassword(this.token).subscribe({
          error: (err: HttpErrorResponse) => {
            this.router.navigateByUrl("/reset-password");
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
  }

  ngOnInit(): void {
    this.authConfigStore.updateFormHasError(this.form.events);
  }
  ngOnDestroy(): void {
    this.authConfigStore.resetFormHasError();
  }

  async submit() {
    this.form.reset(this.form.value);
    if (this.form.invalid) {
      return;
    }
    if (this.token && this.form.value.newPassword) {
      this.userService.resetPassword(this.token, this.form.value.newPassword).subscribe({
        error: (err: HttpErrorResponse) => {
          this.router.navigateByUrl("/reset-password");
          this.notificationService.error({
            title: "resetPassword.token_error." + err.error.error.detail,
            translocoTitle: true,
          });
          this.token_expired.set(true);
        },
        next: (value: Tokens) => {
          this.authService.setToken(value);
          this.userStore.getMe();
          this.router.navigateByUrl("/");
        },
      });
    }
  }
}
