import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { UserCreation, UserService } from "../../libs/data/user";
import { NotificationService } from "@tenzu/utils/services";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [
    EmailFieldComponent,
    FormsModule,
    MatButton,
    MatLabel,
    PasswordFieldComponent,
    ReactiveFormsModule,
    TranslocoDirective,
    MatFormField,
    MatInput,
    MatIcon,
    RouterLink,
    MatError,
  ],
  host: {
    class: "grow",
  },
  template: ` <div *transloco="let t" class="h-full flex flex-col justify-center">
    <div class="basis-11/12">
      <div class="grid grid-cols-1 place-items-center place-content-center gap-y-4">
        @if (!emailSent()) {
          <h1 class="mat-headline-medium">{{ t("signup.title") }}</h1>
          <p class="mat-body-medium">{{ t("signup.subtitle") }}</p>
          @if (!displayForm()) {
            <div data-testid="allOptions-div">
              <button
                data-testid="showEmailSignupForm-button"
                class="primary-button"
                mat-stroked-button
                (click)="displayForm.set(true)"
              >
                {{ t("signup.create_account_email") }}
              </button>
            </div>
          } @else if (displayForm()) {
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
              <mat-form-field>
                <mat-label>{{ t("general.identity.fullname") }}</mat-label>
                <input formControlName="fullName" matInput autocomplete data-testid="fullName-input" type="text" />
                @if (form.controls.fullName.hasError("required")) {
                  <mat-error
                    data-testid="fullName-required-error"
                    [innerHTML]="t('signup.validation.full_name_required')"
                  ></mat-error>
                }
              </mat-form-field>
              <app-email-field formControlName="email"></app-email-field>
              <app-password-field
                formControlName="password"
                [settings]="{
                  strength: { enabled: true, showBar: true },
                }"
              ></app-password-field>
              <div class="min-w-full w-min">
                <small class="mat-body-small" [innerHTML]="t('signup.terms_and_privacy')"></small>
              </div>
              <button data-testid="submitCreateAccount-button" mat-flat-button class="primary-button" type="submit">
                {{ t("signup.create_account") }}
              </button>
              <div class="flex justify-center">
                <button
                  data-testid="allOptions-button"
                  mat-button
                  class="secondary-button"
                  (click)="displayForm.set(false)"
                >
                  <mat-icon class="align-middle">arrow_back_ios</mat-icon>
                  {{ t("signup.all_options") }}
                </button>
              </div>
            </form>
          }
        } @else {
          <span>
            <p class="mat-title-medium">{{ t("signup.verify.title") }}</p>
            <p class="mat-body-medium">
              {{ t("signup.verify.verification_link_sent") }}
              <strong data-testid="sentEmail-block">{{ form.value.email }}</strong>
            </p>
            <p class="mat-body-medium">
              {{ t("signup.verify.mail_not_received") }}
            </p>
            <button
              data-testid="resendMail-button"
              mat-stroked-button
              tabindex="1"
              (keydown.enter)="resendEmail()"
              (click)="resendEmail()"
            >
              {{ t("signup.verify.resend_button") }}
            </button>
          </span>
        }
      </div>
    </div>
    <footer class="text-center">
      @if (!emailSent()) {
        <p class="mat-body-medium">
          {{ t("signup.footer.already_account") }} <a [routerLink]="['/login']">{{ t("signup.footer.login") }}</a>
        </p>
      } @else {
        <p class="mat-body-medium">{{ t("") }}</p>
      }
    </footer>
  </div>`,

  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  notificationService = inject(NotificationService);
  userService = inject(UserService);
  displayForm = signal(false);
  emailSent = signal(false);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    email: ["", Validators.required],
    fullName: ["", Validators.required],
    password: ["", Validators.required],
  });
  route = inject(ActivatedRoute);
  submit(): void {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      const params = this.route.snapshot.queryParams;
      this.userService
        .create({
          ...(this.form.value as Pick<UserCreation, "email" | "fullName" | "password">),
          ...{ acceptTerms: true },
          ...params,
        })
        .subscribe(() => this.emailSent.set(true));
    }
  }
  resendEmail(): void {
    this.submit();
    this.notificationService.open({
      type: "info",
      title: "verify.resent_email_label",
      translocoTitle: true,
      detail: "verify.resent_email_message",
      translocoDetail: true,
    });
  }
}
