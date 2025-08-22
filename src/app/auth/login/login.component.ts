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

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatError, MatFormField, MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { LoginService } from "./login.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatLabel } from "@angular/material/form-field";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { Credential } from "@tenzu/repository/auth";
import { MatDivider } from "@angular/material/divider";
import { AuthFormStateStore } from "../auth-form-state.store";

@Component({
  selector: "app-login",
  imports: [
    MatInput,
    MatFormField,
    ReactiveFormsModule,
    MatButton,
    TranslocoDirective,
    MatLabel,
    PasswordFieldComponent,
    RouterLink,
    MatError,
    MatDivider,
  ],
  template: `
    <div *transloco="let t; prefix: 'login'" class="flex flex-col gap-y-4 ">
      <h1 class="mat-headline-medium">{{ t("title") }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-5">
        <mat-form-field subscriptSizing="fixed">
          <mat-label>
            {{ t("email_or_username") }}
          </mat-label>
          <input matInput autocomplete data-testid="username-input" formControlName="username" />
          @if (form.controls.username.hasError("required")) {
            <mat-error data-testid="username-required-error" [innerHTML]="t('errors.username_required')"></mat-error>
          }
        </mat-form-field>
        <app-password-field formControlName="password"></app-password-field>
        @if (form.hasError("loginError")) {
          <div class="mat-mdc-form-field-error" data-testid="login-401">
            {{ t("errors.401") }}
          </div>
        }
        <a [routerLink]="['/reset-password']" class="mat-body-medium">{{ t("forgot_password") }}</a>
        <button class="primary-button" mat-flat-button type="submit">
          {{ t("action") }}
        </button>
      </form>
      <mat-divider></mat-divider>
      <footer class="text-center">
        <p class="mat-body-medium">
          {{ t("not_registered_yet") }} <a [routerLink]="['/signup']">{{ t("create_account") }}</a>
        </p>
      </footer>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent implements OnInit, OnDestroy {
  service = inject(LoginService);
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    username: ["", Validators.required],
    password: [""],
  });
  route = inject(ActivatedRoute);
  readonly authFormStateStore = inject(AuthFormStateStore);

  ngOnInit(): void {
    this.authFormStateStore.updateHasError(this.form.events);
  }

  ngOnDestroy(): void {
    this.authFormStateStore.resetError();
  }

  submit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      let next = this.route.snapshot.queryParamMap.get("next");
      if (!next) {
        next = "/";
      }
      this.service.login(this.form.value as Credential, next).subscribe({
        error: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.form.setErrors({ loginError: true });
            this.form.controls.username.setErrors({ loginError: true });
            this.form.controls.password.setErrors({ loginError: true });
            this.form.markAsTouched();
          }
        },
      });
    }
  }
}
