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
import { MatError, MatFormField, MatInput } from "@angular/material/input";
import { LoginService } from "./login.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatLabel } from "@angular/material/form-field";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PasswordFieldComponent, passwordSchema } from "@tenzu/shared/components/form/password-field";
import { Credential } from "@tenzu/repository/auth";
import { MatDivider } from "@angular/material/divider";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { apply, Field, form, required, submit } from "@angular/forms/signals";
import { lastValueFrom } from "rxjs";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import SocialAuthLoginComponent from "../social-auth/social-auth-login.component";
import { trackFormValidationEffect } from "@tenzu/repository/auth/utils";

@Component({
  selector: "app-login",
  imports: [
    MatInput,
    MatFormField,
    TranslocoDirective,
    MatLabel,
    PasswordFieldComponent,
    RouterLink,
    MatError,
    MatDivider,
    Field,
    ButtonComponent,
    PasswordFieldComponent,
    SocialAuthLoginComponent,
  ],
  host: {
    class: "flex flex-col gap-4 w-96",
  },
  template: `
    <ng-container *transloco="let t">
      <h1 class="mat-headline-medium text-center">{{ t("auth.login.title") }}</h1>
      <form (submit)="submit($event)" class="flex flex-col gap-2">
        <mat-form-field>
          <mat-label>
            {{ t("auth.login.email_or_username") }}
          </mat-label>
          <input matInput autocomplete="username" [field]="loginForm.username" />
          @for (error of loginForm.username().errors(); track error) {
            <mat-error>{{ t(error.message || "") }} </mat-error>
          }
        </mat-form-field>
        <app-password-field
          [autocomplete]="'current-password'"
          [field]="loginForm.password"
          [settings]="{ enabledStrength: false }"
        />
        <a [routerLink]="['/reset-password']" class="mat-body-medium mb-5">{{ t("auth.login.forgot_password") }}</a>
        <app-button
          level="tertiary"
          translocoKey="auth.login.action"
          type="submit"
          iconName="login"
          [disabled]="!loginForm().dirty() || loginForm().invalid()"
        />
      </form>
      <app-social-auth-login [signup]="false"></app-social-auth-login>
      <mat-divider></mat-divider>
      <footer class="text-center">
        <p class="mat-body-medium">
          {{ t("auth.login.not_registered_yet") }}
          <a [routerLink]="['/signup']" [queryParams]="this.route.snapshot.queryParams">{{
            t("auth.login.create_account")
          }}</a>
        </p>
      </footer>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  service = inject(LoginService);
  route = inject(ActivatedRoute);
  readonly authConfigStore = inject(AuthConfigStore);

  loginForm = form(
    signal<Credential>({
      username: "",
      password: "",
    }),
    (schemaPath) => {
      required(schemaPath.username, { message: "auth.login.errors.username_required" });
      apply(schemaPath.password, passwordSchema({ enabledStrength: false }));
    },
  );

  constructor() {
    // Track form validation state to trigger logo animation when errors occur
    trackFormValidationEffect(this.loginForm);
  }

  async submit(event: SubmitEvent) {
    event.preventDefault();
    await submit(this.loginForm, async (form) => {
      let next = this.route.snapshot.queryParamMap.get("next");
      if (!next) {
        next = "/";
      }
      try {
        await lastValueFrom(this.service.login(form().value(), next));
      } catch {
        this.authConfigStore.setFormHasError(true);
        return [{ fieldTree: this.loginForm.password, kind: "invalid-credentials", message: "auth.login.errors.401" }];
      }
      return undefined;
    });
  }
}
