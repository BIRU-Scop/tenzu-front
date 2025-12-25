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

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { apply, Field, form, required, submit, validate } from "@angular/forms/signals";
import { TranslocoDirective } from "@jsverse/transloco";
import { PasswordFieldComponent, passwordSchema } from "@tenzu/shared/components/form/password-field";
import { UserStore } from "@tenzu/repository/user";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatIcon } from "@angular/material/icon";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { FormFooterComponent } from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-security",
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MatIcon,
    ButtonSaveComponent,
    FormFooterComponent,
    PasswordFieldComponent,
    Field,
  ],
  template: `
    <ng-container *transloco="let t">
      <h1 class="mat-headline-medium">{{ t("settings.security.change_password") }}</h1>
      <form (submit)="submit($event)" class="flex flex-col gap-y-5">
        <app-password-field
          [field]="securityForm.newPassword"
          label="settings.security.new_password"
          [settings]="{ enabledStrength: true, showStrengthBar: true }"
        />
        <app-password-field
          [field]="securityForm.repeatPassword"
          label="settings.security.repeat_password"
          [settings]="{ enabledStrength: false }"
        />

        <div class="flex flex-row">
          <mat-icon class="text-on-error-container pr-3 self-center">warning</mat-icon>
          <p class="mat-body-medium text-on-error-container align-middle">
            {{ t("settings.security.warning") }}
          </p>
        </div>
        <app-form-footer [secondaryAction]="false">
          <app-button-save
            [translocoKey]="'settings.security.save'"
            [disabled]="!securityForm().dirty() || securityForm().invalid()"
          />
        </app-form-footer>
      </form>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full max-w-2xl mx-auto flex flex-col gap-y-8",
  },
})
export class SecurityComponent {
  notificationService = inject(NotificationService);
  userStore = inject(UserStore);
  route = inject(ActivatedRoute);
  securityModel = signal({
    newPassword: "",
    repeatPassword: "",
  });

  securityForm = form(this.securityModel, (schemaPath) => {
    apply(schemaPath.newPassword, passwordSchema({ enabledStrength: true }));
    required(schemaPath.repeatPassword, { message: "form_errors.required" });
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

  async submit(event: Event) {
    event.preventDefault();
    await submit(this.securityForm, async (form) => {
      await this.userStore.changePassword(form().value().newPassword);
      this.notificationService.success({
        title: "settings.security.changes_saved",
        translocoTitle: true,
      });
    });
  }
}
