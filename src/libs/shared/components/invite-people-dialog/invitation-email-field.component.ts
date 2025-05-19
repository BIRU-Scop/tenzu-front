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

import { ChangeDetectionStrategy, Component, input, OnInit } from "@angular/core";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor.directive";
import { MatInput } from "@angular/material/input";
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField } from "@angular/material/form-field";
import { injectNgControl } from "@tenzu/utils/injectors";
import { UserNested } from "@tenzu/repository/user";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NoopValueAccessorDirective],
  imports: [MatInput, ReactiveFormsModule, TranslocoDirective, MatFormField, MatError],
  providers: [],
  selector: "app-invitation-email-field",
  styles: ``,
  template: `
    <mat-form-field *transloco="let t" subscriptSizing="fixed">
      <input
        matInput
        [attr.data-testid]="'invite-email-input-' + ngControl.value"
        type="email"
        [formControl]="ngControl.control"
        autocomplete="email"
      />
      @if (ngControl.hasError("required")) {
        <mat-error
          [attr.data-testid]="'invite-email-required-error-' + ngControl.value"
          [innerHTML]="t('component.email.errors.required')"
        ></mat-error>
      }
      @if (ngControl.hasError("email")) {
        <mat-error [attr.data-testid]="'invite-email-invalid-error-' + ngControl.value">{{
          t("component.email.errors.email")
        }}</mat-error>
      }
      @if (ngControl.hasError("memberExists")) {
        <mat-error [attr.data-testid]="'invite-email-member-error-' + ngControl.value">{{
          t("component.invite_dialog.member_error")
        }}</mat-error>
      }
      <ng-content />
    </mat-form-field>
  `,
})
export class InvitationEmailFieldComponent implements OnInit {
  ngControl = injectNgControl();

  memberEmails = input.required<UserNested["email"][]>();
  pastInvitationExistsError = input.required<boolean>();

  ngOnInit() {
    this.ngControl.control.addValidators([
      Validators.email,
      Validators.required,
      this.memberExistsValidator(),
      this.invitationExistsValidator(),
    ]);
  }

  memberExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.memberEmails().includes(control.value) ? { memberExists: true } : null;
    };
  }
  invitationExistsValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      return this.pastInvitationExistsError() ? { pastInvitationExists: true } : null;
    };
  }
}
