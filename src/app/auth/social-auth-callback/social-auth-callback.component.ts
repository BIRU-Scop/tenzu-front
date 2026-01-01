/*
 * Copyright (C) 2025 BIRU
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

import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import * as Sentry from "@sentry/angular";
import { debug } from "@tenzu/utils/functions/logging";
import { AuthService, ProviderCallback, Tokens } from "@tenzu/repository/auth";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { MatCheckbox } from "@angular/material/checkbox";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { NotificationService } from "@tenzu/utils/services/notification";
import { SendVerifyUserValidator, UserService } from "@tenzu/repository/user";
import PendingVerificationComponent from "../signup/pending-verification/pending-verification.component";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

@Component({
  selector: "app-social-auth-callback",
  standalone: true,
  imports: [
    TranslocoDirective,
    RouterLink,
    MatButton,
    ButtonComponent,
    MatCheckbox,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    PendingVerificationComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      @let _callback = callback();
      @if (_callback) {
        @if (_callback.error === "unverified" && _callback.email) {
          <app-pending-verification [email]="_callback.email" (resendEmail)="resendEmail()"></app-pending-verification>
        } @else if (_callback.error === "missing_terms_acceptance" && _callback.socialSessionKey) {
          @let configLegal = configAppService.configLegal();
          @let _form = form();
          <form [formGroup]="_form" (ngSubmit)="submitCompleteSignup()" class="flex flex-col gap-2 w-[32rem]">
            @if (configLegal) {
              <div class="min-w-full w-min">
                <mat-checkbox
                  [class.checkbox-invalid]="_form.dirty && _form.controls.acceptTerms.hasError('required')"
                  formControlName="acceptTerms"
                  required
                >
                  <p
                    [innerHTML]="
                      t('auth.signup.terms_and_privacy', {
                        termsOfService: configLegal.tos,
                        privacyPolicy: configLegal.privacy,
                      })
                    "
                  ></p>
                </mat-checkbox>
              </div>
              @if (_form.dirty && _form.controls.acceptTerms.hasError("required")) {
                <div class="flex flex-row">
                  <mat-icon class="text-on-error-container pr-3 self-center">warning</mat-icon>
                  <p class="mat-body-medium text-on-error-container align-middle">
                    {{ t("auth.signup.validation.terms_and_privacy_required") }}
                  </p>
                </div>
              }
            }
            <app-button
              level="primary"
              [disabled]="!_form.dirty || _form.invalid"
              type="submit"
              translocoKey="auth.signup.continue"
            />
          </form>
        } @else if (_callback) {
          <div class="flex flex-col gap-4 items-center">
            <p class="text-center">
              <span>{{ t("auth.social.unknown_error", { errorType: _callback.error || "unexpected_state" }) }}</span
              ><br />
              <span>{{ t("auth.social.unknown_error_exit") }}</span>
            </p>
            <a
              class="primary-button"
              mat-flat-button
              [routerLink]="_callback.fromSignup ? '/signup' : '/login'"
              [attr.aria-label]="t('home.navigation.go_home')"
            >
              {{ t("home.navigation.go_home") }}
            </a>
          </div>
        }
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SocialAuthCallbackComponent {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly configAppService = inject(ConfigAppService);
  readonly notificationService = inject(NotificationService);
  readonly userService = inject(UserService);
  readonly fb = inject(NonNullableFormBuilder);

  callback = signal<ProviderCallback | undefined>(undefined);
  form = computed(() =>
    this.fb.group({
      acceptTerms: [false, this.configAppService.configLegal() ? [Validators.required] : []],
    }),
  );

  tryAuthenticate(callback: ProviderCallback) {
    if (callback.access && callback.refresh) {
      this.authService.setToken(callback as Tokens);
      this.router.navigateByUrl(callback.next || "/");
      return true;
    }
    return false;
  }

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((value) => {
      debug("social auth callback", "query params", value);
      const callback = {
        ...value,
        fromSignup: coerceBooleanProperty(value["fromSignup"] || false),
      } as ProviderCallback;
      this.callback.set(callback);
      if (callback.error === "cancelled") {
        this.router.navigateByUrl(callback.fromSignup ? "/signup" : "/login");
      } else if (!this.tryAuthenticate(callback)) {
        if (
          !(callback.error === "unverified" && callback.email) &&
          !(callback.error === "missing_terms_acceptance" && callback.socialSessionKey)
        ) {
          this.logUnexpectedState(callback);
        }
      }
    });
  }

  resendEmail(): void {
    const callback = this.callback();
    if (callback && callback.email) {
      this.userService.resentVerification(callback as SendVerifyUserValidator).subscribe();
    }
  }

  submitCompleteSignup(): void {
    const form = this.form();
    const socialSessionKey = this.callback()?.socialSessionKey;
    if (form.valid && socialSessionKey) {
      const acceptTerms = form.value.acceptTerms || false;
      this.authService
        .continueSignup({
          ...{ acceptTermsOfService: acceptTerms, acceptPrivacyPolicy: acceptTerms },
          socialSessionKey,
        })
        .subscribe(
          (callback) => {
            if (!this.tryAuthenticate(callback)) {
              this.callback.set({ ...this.callback(), ...callback });
            }
          },
          (err) => {
            this.notificationService.error({ title: err?.error?.detail, translocoTitle: false });
          },
        );
    }
  }

  logUnexpectedState(callback: ProviderCallback): void {
    debug("social-auth-callback", "UNEXPECTED", callback.error);
    Sentry.captureMessage("Unexpected error received by social callback", {
      level: "error",
      extra: { callbackData: callback },
    });
  }
}
