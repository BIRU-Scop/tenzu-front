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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor.directive";
import { MatInput } from "@angular/material/input";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError, MatFormField } from "@angular/material/form-field";
import { injectNgControl } from "@tenzu/utils/injectors";
import { UserNested } from "@tenzu/repository/user";
import { InvitationBase } from "@tenzu/repository/membership";
import { MatCheckbox } from "@angular/material/checkbox";
import { ErrorStateMatcher } from "@angular/material/core";

export class InvitationErrorStateMatcher implements ErrorStateMatcher {
  /** Enter error state when parent contains cross field error. */
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid || form?.hasError("pastInvitationExists"));
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NoopValueAccessorDirective],
  imports: [MatInput, ReactiveFormsModule, TranslocoDirective, MatFormField, MatError, MatCheckbox],
  providers: [{ provide: ErrorStateMatcher, useClass: InvitationErrorStateMatcher }],
  selector: "app-invitation-email-field",
  styles: `
    ::ng-deep.mdc-label {
      font-family: var(--mat-form-field-subscript-text-font, var(--mat-sys-body-small-font));
      line-height: var(--mat-form-field-subscript-text-line-height, var(--mat-sys-body-small-line-height));
      font-size: var(--mat-form-field-subscript-text-size, var(--mat-sys-body-small-size));
      letter-spacing: var(--mat-form-field-subscript-text-tracking, var(--mat-sys-body-small-tracking));
      font-weight: var(--mat-form-field-subscript-text-weight, var(--mat-sys-body-small-weight));
    }
    mat-checkbox.ng-invalid {
      --checkbox-background-color: var(--mat-sys-error);

      ::ng-deep.mdc-label {
        color: var(--mat-sys-on-error-container);
      }
    }
  `,
  template: `
    <form [formGroup]="form" *transloco="let t">
      <mat-form-field subscriptSizing="fixed">
        <input
          matInput
          [attr.data-testid]="'invite-email-input-' + ngControl.value"
          type="email"
          formControlName="email"
          autocomplete="email"
        />
        @if (form.controls.email.hasError("required")) {
          <mat-error
            [attr.data-testid]="'invite-email-required-error-' + form.controls.email.value"
            [innerHTML]="t('component.email.errors.required')"
          ></mat-error>
        }
        @if (form.controls.email.hasError("email")) {
          <mat-error [attr.data-testid]="'invite-email-invalid-error-' + form.controls.email.value">{{
            t("component.email.errors.email")
          }}</mat-error>
        }
        @if (form.controls.email.hasError("memberExists")) {
          <mat-error [attr.data-testid]="'invite-email-member-error-' + form.controls.email.value">{{
            t("component.invite_dialog.member_error")
          }}</mat-error>
        }
      </mat-form-field>
      @if (doesPastInvitationExists(form.controls.email.value)) {
        <div class="mat-mdc-form-field-subscript-wrapper mat-mdc-form-field-bottom-align">
          <div class="mat-mdc-form-field-error-wrapper">
            <mat-error
              class="flex justify-center items-center"
              [class.mat-mdc-form-field-error]="!form.controls.resendExisting.valid"
            >
              {{ t("component.invite_dialog.duplicate_error") }}
              <mat-checkbox formControlName="resendExisting">
                {{ t("component.invite_dialog.duplicate_error_ok") }}
              </mat-checkbox>
            </mat-error>
          </div>
        </div>
      }
    </form>
  `,
})
export class InvitationEmailFieldComponent implements AfterViewInit {
  ngControl = injectNgControl();
  memberEmails = input.required<UserNested["email"][]>();
  notAcceptedInvitationEmails = input.required<InvitationBase["email"][]>();

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    email: ["", [Validators.email, Validators.required]],
    resendExisting: [false, [Validators.requiredTrue]],
  });

  ngAfterViewInit() {
    // Validator making use of input can't be added directly in form builder
    // because inputs will not be available yet. So we add them here
    this.form.controls.email.addValidators([this.memberExistsValidator()]);
    this.form.addValidators([this.invitationExistsValidator()]);

    this.form.controls.email.setValue(this.ngControl.control.value);

    this.form.controls.email.valueChanges.subscribe(() => {
      this.ngControl.control.setValue(this.form.value.email);
    });
    this.form.statusChanges.subscribe(() => {
      this.ngControl.control.setErrors(this.form.errors || this.form.controls.email.errors);
    });

    this.form.updateValueAndValidity();
  }

  doesPastInvitationExists(email: InvitationBase["email"]) {
    return this.notAcceptedInvitationEmails().includes(email);
  }

  memberExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.memberEmails().includes(control.value) ? { memberExists: true } : null;
    };
  }
  invitationExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.doesPastInvitationExists(control.value.email) && !control.value.resendExisting
        ? { pastInvitationExists: true }
        : null;
    };
  }
}
