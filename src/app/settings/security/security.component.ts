import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatError, MatLabel } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { passwordsMustMatch } from "@tenzu/utils";
import { LoginService } from "../../login/login.service";
import { HttpErrorResponse } from "@angular/common/http";
import { UserStore } from "@tenzu/data/user";

@Component({
  selector: "app-security",
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoDirective, MatLabel, MatButton, MatError, PasswordFieldComponent],
  template: `
    <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'settings.security'">
      <h1 class="mat-headline-medium">{{ t("change_password") }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
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
        <button data-testid="saveProfileSettings-button" mat-flat-button class="primary-button" type="submit">
          {{ t("save") }}
        </button>
      </form>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityComponent {
  fb = inject(NonNullableFormBuilder);
  loginService = inject(LoginService);
  userStore = inject(UserStore);
  form = this.fb.group({
    currentPassword: ["", Validators.required],
    newPassword: ["", Validators.required],
    repeatPassword: ["", Validators.required],
  });

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

  constructor() {
    this.form.addValidators([passwordsMustMatch]);
  }
}
