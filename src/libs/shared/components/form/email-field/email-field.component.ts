/*
 * Copyright (C) 2024-2025 BIRU
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

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor.directive";
import { emailRegexPatternValidation } from "@tenzu/shared/components/form/email-field/utils";
import { injectNgControl } from "@tenzu/utils/injectors";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NoopValueAccessorDirective],
  imports: [MatLabel, MatInput, ReactiveFormsModule, TranslocoDirective, MatFormField, MatError, MatLabel],
  providers: [],
  selector: "app-email-field",
  styles: ``,
  template: `
    <mat-form-field *transloco="let t; prefix: 'component.email'" subscriptSizing="fixed">
      <mat-label>
        {{ t("label") }}
      </mat-label>
      <input matInput data-testid="email-input" type="email" [formControl]="ngControl.control" autocomplete="email" />
      @if (ngControl.hasError("required")) {
        <mat-error data-testid="email-required-error" [innerHTML]="t('errors.required')"></mat-error>
      }
      @if (ngControl.hasError("invalidEmail")) {
        <mat-error>{{ t("errors.email") }}</mat-error>
      }
    </mat-form-field>
  `,
})
export class EmailFieldComponent implements OnInit {
  ngControl = injectNgControl();

  ngOnInit() {
    this.ngControl.control.addValidators(this.createEmailValidator());
  }

  createEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          required: true,
        };
      }
      return !emailRegexPatternValidation.test(control.value) ? { invalidEmail: true } : null;
    };
  }
}
