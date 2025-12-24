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

import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { CreateUserPayload, SendVerifyUserValidator, UserService } from "@tenzu/repository/user";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatDivider } from "@angular/material/divider";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import { MatCheckbox } from "@angular/material/checkbox";
import { LanguageStore } from "@tenzu/repository/transloco";
import { MatOption, MatSelect } from "@angular/material/select";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { AuthService } from "@tenzu/repository/auth";
import SocialAuthCallbackComponent from "../social-auth/social-auth-login.component";
import PendingVerificationComponent from "./pending-verification.component";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-signup",
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatLabel,
    PasswordFieldComponent,
    ReactiveFormsModule,
    TranslocoDirective,
    MatFormField,
    MatInput,
    RouterLink,
    MatError,
    MatDivider,
    MatCheckbox,
    MatOption,
    MatSelect,
    ButtonComponent,
    SocialAuthCallbackComponent,
    PendingVerificationComponent,
  ],
  template: ` <div *transloco="let t" class="flex flex-col gap-4">
    @let _form = form();
    @if (!emailSent()) {
      <h1 class="mat-headline-medium text-center">{{ t("auth.signup.title") }}</h1>
      @if (!displayForm()) {
        <div class="flex flex-col gap-y-4">
          <app-button
            level="primary"
            iconName="mail"
            translocoKey="auth.signup.create_account_email"
            (click)="displayForm.set(true)"
          />
          <app-social-auth-login [signup]="true"></app-social-auth-login>
        </div>
      } @else if (displayForm()) {
        @let configLegal = configAppService.configLegal();
        <form [formGroup]="_form" (ngSubmit)="submit()" class="flex flex-col gap-1 w-[32rem]">
          <mat-form-field>
            <mat-label>{{ t("general.identity.fullname") }}</mat-label>
            <input formControlName="fullName" matInput autocomplete data-testid="fullName-input" type="text" />
            @if (_form.controls.fullName.hasError("required")) {
              <mat-error
                data-testid="fullName-required-error"
                [innerHTML]="t('auth.signup.validation.full_name_required')"
              ></mat-error>
            }
          </mat-form-field>
          <app-email-field formControlName="email" />
          <app-password-field
            class="mb-4"
            formControlName="password"
            [settings]="{
              strength: { enabled: true, showBar: true },
            }"
          />
          <mat-form-field>
            <mat-label>{{ t("general.identity.lang") }}</mat-label>
            <mat-select formControlName="lang" data-testid="lang-select">
              @for (language of languageStore.entities(); track language.code) {
                <mat-option [value]="language.code">{{ language.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (configLegal) {
            <div class="min-w-full w-min">
              <mat-checkbox formControlName="acceptTerms" required>
                <div class="flex flex-col">
                  <small
                    class="mat-body-small"
                    [innerHTML]="
                      t('auth.signup.terms_and_privacy', {
                        termsOfService: configLegal.tos,
                        privacyPolicy: configLegal.privacy,
                      })
                    "
                  ></small>
                </div>
              </mat-checkbox>
            </div>
          }
          <div class="flex flex-row justify-end gap-4">
            <app-button
              level="secondary"
              translocoKey="auth.signup.all_options"
              iconName="arrow_back_ios"
              (click)="displayForm.set(false)"
            />
            <app-button
              [disabled]="!_form.dirty || _form.invalid"
              iconName="add"
              level="tertiary"
              translocoKey="auth.signup.create_account"
              data-testid="submitCreateAccount-button"
              type="submit"
            />
          </div>
        </form>
      }
      <mat-divider></mat-divider>
      <footer class="text-center">
        <p class="mat-body-medium">
          {{ t("auth.signup.footer.already_account") }}
          <a [routerLink]="['/login']" [queryParams]="this.route.snapshot.queryParams">{{
            t("auth.signup.footer.login")
          }}</a>
        </p>
      </footer>
    } @else if (_form.value.email) {
      <app-pending-verification [email]="_form.value.email" (resendEmail)="resendEmail()"></app-pending-verification>
    }
  </div>`,
  styles: `
    mat-checkbox.ng-invalid.ng-dirty {
      --checkbox-background-color: var(--mat-sys-error);

      ::ng-deep.mdc-label {
        color: var(--mat-sys-on-error-container);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignupComponent implements OnInit, OnDestroy {
  notificationService = inject(NotificationService);
  languageStore = inject(LanguageStore);
  userService = inject(UserService);
  configAppService = inject(ConfigAppService);
  fb = inject(NonNullableFormBuilder);
  route = inject(ActivatedRoute);
  readonly authConfigStore = inject(AuthConfigStore);
  readonly authService = inject(AuthService);

  displayForm = signal(false);
  emailSent = signal(false);
  queryParamMap = toSignal(this.route.queryParamMap);
  form = computed(() => {
    const initialEmail = this.queryParamMap()?.get("email") || "";
    return this.fb.group({
      email: [initialEmail, [Validators.required, Validators.email]],
      fullName: ["", [Validators.required, Validators.maxLength(256)]],
      password: [""],
      lang: [this.languageStore.entities().find((language) => language.isDefault)?.code],
      acceptTerms: [false],
    });
  });

  ngOnInit(): void {
    const form = this.form();
    this.authConfigStore.updateFormHasError(form.events);
    const configLegal = this.configAppService.configLegal();
    if (configLegal) {
      form.controls.acceptTerms.addValidators([Validators.requiredTrue]);
    }
  }
  ngOnDestroy(): void {
    this.authConfigStore.resetFormHasError();
  }
  submit(): void {
    const form = this.form();
    form.reset(form.value);
    if (form.valid) {
      const params = this.route.snapshot.queryParams;
      const acceptTerms = form.value.acceptTerms || false;
      this.userService
        .create({
          ...(form.value as Pick<CreateUserPayload, "email" | "fullName" | "password" | "color" | "lang">),
          ...{ acceptTermsOfService: acceptTerms, acceptPrivacyPolicy: acceptTerms },
          ...params,
        })
        .subscribe(() => this.emailSent.set(true));
    }
  }
  resendEmail(): void {
    const form = this.form();
    if (form.valid) {
      const params = this.route.snapshot.queryParams;
      this.userService
        .resentVerification({
          ...(form.value as Pick<SendVerifyUserValidator, "email">),
          ...params,
        })
        .subscribe();
    }
  }
}
