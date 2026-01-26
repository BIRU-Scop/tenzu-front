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

import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from "@angular/core";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { ActivatedRoute, Params, RouterLink } from "@angular/router";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { PasswordFieldComponent, passwordSchema } from "@tenzu/shared/components/form/password-field";
import { CreateUserPayload, UserService } from "@tenzu/repository/user";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatDivider } from "@angular/material/divider";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import { MatCheckbox } from "@angular/material/checkbox";
import { LanguageStore } from "@tenzu/repository/transloco";
import { MatOption, MatSelect } from "@angular/material/select";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { apply, applyWhenValue, FormField, form, maxLength, required, submit } from "@angular/forms/signals";
import { emailSchema } from "@tenzu/shared/components/form/email-field/schema";
import { lastValueFrom } from "rxjs";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { AuthService, InvitationTokens, trackFormValidationEffect } from "@tenzu/repository/auth";
import SocialAuthLoginComponent from "../shared/social-auth-login/social-auth-login.component";
import PendingVerificationComponent from "./pending-verification/pending-verification.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";

@Component({
  selector: "app-signup",
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatLabel,
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
    PasswordFieldComponent,
    FormField,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
    SocialAuthLoginComponent,
    PendingVerificationComponent,
  ],
  host: {
    class: "flex flex-col gap-4",
  },
  template: ` <ng-container *transloco="let t" class="flex flex-col gap-4">
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
        <form (submit)="submit($event)" class="flex flex-col gap-1 w-[32rem]">
          <mat-form-field>
            <mat-label>{{ t("general.identity.fullname") }}</mat-label>
            <input [formField]="signupForm.fullName" matInput autocomplete type="text" />
            @for (error of signupForm.fullName().errors(); track error.kind) {
              <mat-error>{{ t(error.message || "") }}</mat-error>
            }
          </mat-form-field>
          <app-email-field [formField]="signupForm.email" />
          <app-password-field [formField]="signupForm.password" [settings]="{ enabledStrength: true }" />
          <mat-form-field>
            <mat-label>{{ t("general.identity.lang") }}</mat-label>
            <mat-select [formField]="signupForm.lang" data-testid="lang-select">
              @for (language of languageStore.entities(); track language.code) {
                <mat-option [value]="language.code">{{ language.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (configLegal) {
            <mat-checkbox
              [class.checkbox-invalid]="
                signupForm.acceptTermsOfService().touched() && signupForm.acceptTermsOfService().invalid()
              "
              [formField]="signupForm.acceptTermsOfService"
            >
              <small
                class="mat-body-small"
                [innerHTML]="
                  t('auth.signup.terms_and_privacy', {
                    termsOfService: configLegal.tos,
                    privacyPolicy: configLegal.privacy,
                  })
                "
              ></small>
            </mat-checkbox>
          }
          <app-form-footer>
            <app-button
              appFormFooterSecondaryAction
              level="secondary"
              translocoKey="auth.signup.all_options"
              iconName="arrow_back_ios"
              (click)="displayForm.set(false)"
            />
            <app-button
              [disabled]="!signupForm().dirty() || signupForm().invalid()"
              iconName="add"
              level="tertiary"
              translocoKey="auth.signup.create_account"
              data-testid="submitCreateAccount-button"
              type="submit"
            />
          </app-form-footer>
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
    } @else if (signupForm.email().value()) {
      <app-pending-verification
        [email]="signupForm.email().value()"
        (resendEmail)="resendEmail()"
      ></app-pending-verification>
    }
  </ng-container>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignupComponent {
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  languageStore = inject(LanguageStore);
  configAppService = inject(ConfigAppService);
  fb = inject(NonNullableFormBuilder);
  route = inject(ActivatedRoute);
  readonly authConfigStore = inject(AuthConfigStore);
  readonly authService = inject(AuthService);
  displayForm = signal(false);
  emailSent = signal(false);
  signupModel = signal<CreateUserPayload>({
    fullName: "",
    email: "",
    password: "",
    lang: "",
    acceptTermsOfService: false,
    acceptPrivacyPolicy: false,
  });
  signupForm = form(this.signupModel, (schemaPath) => {
    required(schemaPath.fullName, { message: "auth.signup.validation.full_name_required" });
    maxLength(schemaPath.fullName, 256);
    apply(schemaPath.email, emailSchema);
    apply(schemaPath.password, passwordSchema({ enabledStrength: true }));
    applyWhenValue(
      schemaPath,
      () => !!this.configAppService.configLegal(),
      (schemaPath) => {
        required(schemaPath.acceptTermsOfService, { message: "auth.signup.validation.accept_terms_required" });
      },
    );
  });

  queryParamMap = toSignal(this.route.queryParamMap);

  constructor() {
    effect(() => {
      const initialEmail = this.queryParamMap()?.get("email") || "";
      untracked(() => {
        this.signupModel.update((value) => ({ ...value, email: initialEmail }));
      });
    });
    effect(() => {
      const language = this.languageStore.entities().find((language) => language.isDefault)?.code;
      untracked(() => {
        if (language) {
          this.signupModel.update((value) => ({ ...value, lang: language }));
        }
      });
    });
    trackFormValidationEffect(this.signupForm);
  }

  parseParams(params: Params) {
    const parsedParams: InvitationTokens = {};
    if (params["acceptProjectInvitation"]) {
      parsedParams.acceptProjectInvitation = !!params["acceptProjectInvitation"];
    }
    if (params["acceptWorkspaceInvitation"]) {
      parsedParams.acceptWorkspaceInvitation = !!params["acceptWorkspaceInvitation"];
    }
    return { ...params, ...parsedParams };
  }

  async submit(event: Event) {
    event.preventDefault();
    await submit(this.signupForm, async (form) => {
      const params = this.parseParams(this.route.snapshot.queryParams);
      const values = form().value();
      try {
        await lastValueFrom(
          this.userService.create({
            ...values,
            ...{ acceptPrivacyPolicy: values.acceptTermsOfService },
            ...params,
          }),
        );
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status === 422 && this.authService.isPasswordError(error)) {
          debug("error-422", "password", error);
          this.authConfigStore.setFormHasError(true);
          return [
            { fieldTree: this.signupForm.password, kind: "password-rejected", message: "auth.signup.errors.422" },
          ];
        } else {
          throw error;
        }
      }
      this.emailSent.set(true);
      return undefined;
    });
  }
  resendEmail(): void {
    const form = this.signupForm();
    if (form.valid()) {
      const params = this.parseParams(this.route.snapshot.queryParams);
      this.userService
        .resentVerification({
          ...form.value(),
          ...params,
        })
        .subscribe();
    }
  }
}
