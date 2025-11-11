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
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatError } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { LoginService } from "../../auth/login/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { UserStore } from "@tenzu/repository/user";
import { passwordsMustMatch } from "@tenzu/utils/validators";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatIcon } from "@angular/material/icon";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { FormFooterComponent } from "@tenzu/shared/components/ui/form-footer/form-footer.component";

@Component({
  selector: "app-security",
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MatError,
    PasswordFieldComponent,
    MatIcon,
    ButtonSaveComponent,
    FormFooterComponent,
  ],
  template: `
    <div class="max-w-2xl mx-auto flex flex-col gap-y-8" *transloco="let t; prefix: 'settings.security'">
      <h1 class="mat-headline-medium">{{ t("change_password") }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-5">
        <div>
          <app-password-field
            formControlName="currentPassword"
            [settings]="{
              strength: { enabled: false, showBar: false },
              label: t('current_password'),
            }"
          ></app-password-field>
          @if (form.hasError("invalidCurrentPassword")) {
            <mat-error class="mat-body-medium">
              {{ t("invalid_current_password") }}
            </mat-error>
          }
        </div>
        <div>
          <app-password-field
            formControlName="newPassword"
            [settings]="{
              strength: { enabled: true, showBar: true },
              label: t('new_password'),
            }"
          ></app-password-field>
        </div>
        <div>
          <app-password-field
            formControlName="repeatPassword"
            [settings]="{
              strength: { enabled: false, showBar: false },
              label: t('repeat_password'),
            }"
          >
          </app-password-field>
          @if (form.hasError("passwordNotMatch")) {
            <mat-error class="mat-body-medium">
              {{ t("password_not_match") }}
            </mat-error>
          }
        </div>
        <div class="flex flex-row">
          <mat-icon class="text-on-error-container pr-3 self-center">warning</mat-icon>
          <p class="mat-body-medium text-on-error-container align-middle" [innerHTML]="t('warning')"></p>
        </div>
        <app-form-footer [secondaryAction]="false">
          <app-button-save [translocoKey]="'settings.security.save'" [disabled]="!form.dirty || form.invalid" />
        </app-form-footer>
      </form>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full",
  },
})
export class SecurityComponent {
  fb = inject(NonNullableFormBuilder);
  notificationService = inject(NotificationService);
  loginService = inject(LoginService);
  userStore = inject(UserStore);
  form = this.fb.group(
    {
      currentPassword: [""],
      newPassword: [""],
      repeatPassword: [""],
    },
    { validators: passwordsMustMatch },
  );

  submit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      this.loginService
        .checkPassword({
          username: this.userStore.myUser().username,
          password: this.form.value.currentPassword!,
        })
        .subscribe({
          next: () => {
            this.userStore.changePassword(this.form.value.newPassword!);
            this.notificationService.success({
              title: "settings.security.changes_saved",
              translocoTitle: true,
            });
          },
          error: (error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
              this.form.controls.currentPassword.setErrors({ invalidCurrentPassword: true });
              this.form.setErrors({ invalidCurrentPassword: true });
            }
          },
        });
    }
  }
}
