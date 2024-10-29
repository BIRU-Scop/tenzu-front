import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatOption, MatSelect } from "@angular/material/select";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { UserStore } from "@tenzu/data/user";
import { LanguageStore } from "@tenzu/data/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    AvatarComponent,
    ReactiveFormsModule,
    MatInput,
    EmailFieldComponent,
    TranslocoDirective,
    MatFormField,
    MatLabel,
    MatButton,
    MatSelect,
    MatOption,
  ],
  template: `
    <div class="flex flex-col gap-y-8" *transloco="let t">
      <h1 class="mat-headline-medium">{{ t("settings.profile.title") }}</h1>
      <app-avatar
        [name]="form.value.fullName || userStore.myUser().fullName"
        [rounded]="true"
        [color]="userStore.myUser().color"
        size="xl"
      ></app-avatar>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
        <mat-form-field>
          <mat-label>{{ t("general.identity.fullname") }}</mat-label>
          <input formControlName="fullName" matInput autocomplete data-testid="fullName-input" type="text" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.email") }}</mat-label>
          <input formControlName="email" matInput autocomplete data-testid="email-input" type="text" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.lang") }}</mat-label>
          <mat-select formControlName="lang" data-testid="lang-select">
            @for (language of languageStore.entities(); track language.code) {
              <mat-option [value]="language.code">{{ language.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <button data-testid="saveProfileSettings-button" mat-flat-button class="primary-button" type="submit">
          {{ t("settings.profile.save") }}
        </button>
      </form>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  userStore = inject(UserStore);
  languageStore = inject(LanguageStore);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    fullName: ["", Validators.required],
    lang: ["", Validators.required],
    email: ["", Validators.required],
  });

  constructor() {
    toObservable(this.userStore.myUser).subscribe((values) => {
      this.form.patchValue({
        fullName: values.fullName,
        lang: values.lang,
        email: values.email,
      });
      this.form.controls.email.disable();
    });
  }

  submit(): void {
    this.form.reset(this.form.getRawValue());
    if (this.form.valid) {
      this.userStore.patchMe(this.form.getRawValue());
    }
  }
}
