/*
 * Copyright (C) 2024 BIRU
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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatOption, MatSelect } from "@angular/material/select";
import { UserStore } from "@tenzu/data/user";
import { LanguageStore } from "@tenzu/data/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

@Component({
  selector: "app-profile",
  imports: [
    AvatarComponent,
    ReactiveFormsModule,
    MatInput,
    TranslocoDirective,
    MatFormField,
    MatLabel,
    MatButton,
    MatSelect,
    MatOption,
  ],
  template: `
    <div class="max-w-2xl flex flex-col gap-y-8 mx-auto" *transloco="let t">
      <h1 class="mat-headline-medium">{{ t("settings.profile.title") }}</h1>
      <app-avatar
        [name]="form.value.fullName || userStore.myUser().fullName"
        [rounded]="true"
        [color]="userStore.myUser().color"
        size="xl"
      ></app-avatar>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-5">
        <mat-form-field>
          <mat-label>{{ t("general.identity.fullname") }}</mat-label>
          <input formControlName="fullName" matInput autocomplete data-testid="fullName-input" type="text" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.username") }}</mat-label>
          <input formControlName="username" matInput autocomplete data-testid="userName-input" type="text" />
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
  host: {
    class: "w-full",
  },
})
export class ProfileComponent {
  userStore = inject(UserStore);
  languageStore = inject(LanguageStore);
  fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    fullName: ["", Validators.required],
    username: ["", Validators.required],
    lang: ["", Validators.required],
    email: ["", Validators.required],
  });

  constructor() {
    toObservable(this.userStore.myUser).subscribe((values) => {
      this.form.patchValue({
        fullName: values.fullName,
        username: values.username,
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
