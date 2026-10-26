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

import { Component, inject, linkedSignal } from "@angular/core";
import { MatError, MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatOption, MatSelect } from "@angular/material/select";
import { UserStore } from "@tenzu/repository/user/user.store";
import { LanguageStore } from "@tenzu/repository/transloco/language.store";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { FormFooterComponent } from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { TitleCasePipe } from "@angular/common";
import { UserAvatarInputComponent } from "@tenzu/shared/components/user-avatar-input/user-avatar-input.component";
import {
  form,
  FormField,
  FormRoot,
  StandardSchemaValidationError,
  validateStandardSchema,
  ValidationError,
} from "@angular/forms/signals";
import {
  UpdateUserProfilePayload,
  updateUserProfilePayloadSchema,
  USER_FULL_NAME_MAX_LENGTH,
} from "@tenzu/repository/user/user.model";

@Component({
  selector: "app-profile",
  imports: [
    MatInput,
    TranslocoDirective,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    ButtonSaveComponent,
    FormFooterComponent,
    TitleCasePipe,
    UserAvatarInputComponent,
    FormRoot,
    FormField,
  ],
  template: `
    @let user = userStore.myUser();
    <div class="max-w-2xl flex flex-col gap-y-8 mx-auto" *transloco="let t">
      <h1 class="mat-headline-medium">{{ t("settings.profile.title") }}</h1>
      <form [formRoot]="userForm" class="flex flex-col gap-y-5">
        <app-user-avatar-input
          [(userModel)]="userModel"
          [color]="user.color"
          [userAvatar]="userModel().avatar"
          [userAvatarUrl]="user.avatar"
          (changed)="onAvatarChange()"
        />
        <mat-form-field>
          <mat-label>{{ t("general.identity.fullname") }}</mat-label>
          <input [formField]="userForm.fullName" matInput autocomplete data-testid="fullName-input" type="text" />
          @for (error of userForm.fullName().errors(); track error.kind) {
            <mat-error>{{ t(fullNameErrorKey(error), { length: fullNameMaxLength }) }}</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.username") }}</mat-label>
          <input [value]="user.username" matInput disabled data-testid="userName-input" type="text" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.email") }}</mat-label>
          <input [value]="user.email" matInput disabled data-testid="email-input" type="text" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ t("general.identity.lang") }}</mat-label>
          <mat-select [formField]="userForm.lang" data-testid="lang-select">
            @for (language of languageStore.entities(); track language.code) {
              <mat-option [value]="language.code">{{ language.name | titlecase }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <app-form-footer [secondaryAction]="false">
          <app-button-save
            data-testid="saveProfileSettings-button"
            [disabled]="!userForm().dirty() || userForm().invalid()"
          />
        </app-form-footer>
      </form>
    </div>
  `,
  styles: ``,
  host: {
    class: "w-full",
  },
})
export class ProfileComponent {
  userStore = inject(UserStore);
  languageStore = inject(LanguageStore);
  notificationService = inject(NotificationService);

  protected readonly fullNameMaxLength = USER_FULL_NAME_MAX_LENGTH;

  userModel = linkedSignal<UpdateUserProfilePayload>(() => {
    const user = this.userStore.myUser();
    return { fullName: user.fullName, lang: user.lang, avatar: undefined };
  });
  userForm = form(
    this.userModel,
    (schemaPath) => {
      validateStandardSchema(schemaPath, updateUserProfilePayloadSchema);
    },
    {
      submission: {
        action: async (form) => {
          await this.userStore.patchMeRequest(updateUserProfilePayloadSchema.parse(form().value()));
          this.notificationService.success({
            title: "settings.profile.changes_saved",
            translocoTitle: true,
          });
          form().reset(form().value());
        },
      },
    },
  );

  protected fullNameErrorKey(error: ValidationError): string {
    if (error instanceof StandardSchemaValidationError) {
      const code = (error.issue as { code?: string }).code;
      if (code === "too_small") {
        return "form_errors.required";
      }
      if (code === "too_big") {
        return "form_errors.max_length";
      }
    }
    return error.message ?? "";
  }

  protected onAvatarChange() {
    this.userForm().markAsDirty();
  }
}
