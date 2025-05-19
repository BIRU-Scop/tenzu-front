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
import { ReactiveFormsModule, ValidationErrors, ValidatorFn } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatError } from "@angular/material/form-field";
import { injectNgControl } from "@tenzu/utils/injectors";
import { MatCheckbox } from "@angular/material/checkbox";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, TranslocoDirective, MatError, MatCheckbox],
  providers: [],
  selector: "app-invitation-resend-field",
  styles: ``,
  template: `
    <div *transloco="let t" class="flex">
      <div class="mat-mdc-form-field-subscript-wrapper mat-mdc-form-field-bottom-align">
        <div class="mat-mdc-form-field-error-wrapper">
          <mat-error class="mat-mdc-form-field-error mat-mdc-form-field-bottom-align ng-star-inserted">{{
            t("component.invite_dialog.duplicate_error")
          }}</mat-error>
        </div>
      </div>
      <mat-checkbox [formControl]="ngControl.control">{{
        t("component.invite_dialog.duplicate_error_ok")
      }}</mat-checkbox>
    </div>
  `,
})
export class InvitationResendFieldComponent implements OnInit {
  ngControl = injectNgControl();

  pastInvitationExistsError = input.required<boolean>();

  ngOnInit() {
    this.ngControl.control.addValidators([this.invitationExistsValidator()]);
  }
  invitationExistsValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      return this.pastInvitationExistsError() ? { pastInvitationExists: true } : null;
    };
  }
}
