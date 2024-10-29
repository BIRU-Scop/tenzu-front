import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { MatError } from "@angular/material/form-field";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, UserStore } from "@tenzu/data/user";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService, Tokens } from "@tenzu/data/auth";
import { passwordsMustMatch } from "@tenzu/utils";

@Component({
  selector: "app-reset-password-form",
  standalone: true,
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    TranslocoDirective,
    PasswordFieldComponent,
    MatError,
  ],
  template: `
    <div *transloco="let t; prefix: 'resetPassword'" class="h-full flex flex-col justify-center">
      <main class="basis-11/12">
        <div class="grid grid-cols-1 place-items-center place-content-center gap-y-4">
          @if (!token_expired()) {
            <h1 class="mat-headline-medium">
              {{ t("choose_new_password") }}
            </h1>
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
              @if (form.hasError("passwordNotMatch")) {
                <mat-error class="mat-body-medium">
                  {{ t("password_not_match") }}
                </mat-error>
              }
              <app-password-field
                formControlName="newPassword"
                [settings]="{
                  strength: { enabled: true, showBar: true },
                  label: t('new_password'),
                }"
              ></app-password-field>
              <app-password-field
                formControlName="repeatPassword"
                [settings]="{
                  strength: { enabled: false },
                  label: t('repeat_password'),
                }"
              >
              </app-password-field>
              <button
                data-testid="submitChangePassword-button"
                mat-flat-button
                class="primary-button"
                type="submit"
                [disabled]="form.invalid"
              >
                {{ t("change_password") }}
              </button>
            </form>
          } @else {
            <h3>{{ t("token_error." + error()) }}</h3>
          }
        </div>
      </main>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordFormComponent {
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group(
    {
      newPassword: ["", Validators.required],
      repeatPassword: ["", Validators.required],
    },
    { validators: passwordsMustMatch },
  );
  token: string | null = "";
  token_expired = model(false);
  error = model("");
  userService = inject(UserService);
  userStore = inject(UserStore);
  authService = inject(AuthService);
  router = inject(Router);

  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe((value) => {
      this.token = value.get("token");
      if (this.token) {
        this.userService.verifyResetTokenPassword(this.token).subscribe({
          error: (err: HttpErrorResponse) => {
            this.error.set(err.error.error.detail);
            this.token_expired.set(true);
          },
          next: (value1) => {
            this.token_expired.set(!value1);
          },
        });
      }
    });
  }

  async submit() {
    this.form.reset(this.form.value);
    if (this.form.invalid) {
      return;
    }
    if (this.token && this.form.value.newPassword) {
      this.userService.resetPassword(this.token, this.form.value.newPassword).subscribe({
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error.error.detail);
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
