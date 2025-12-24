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

import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import type { Validators } from "@angular/forms";
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";

type TranslocoParams = Record<string, string | number>;

type ValidatorConfig = {
  type: keyof typeof Validators;
  message: string;
  translocoParams?: TranslocoParams;
  validatorFn: ValidatorFn;
};

export type NameDialogData = {
  label: string;
  action: string;
  placeholder?: string;
  defaultValue?: string;
  validators?: ValidatorConfig[];
};

@Component({
  selector: "app-enter-name-dialog",
  imports: [
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatDialogClose,
    MatError,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
    ButtonCloseComponent,
    ButtonAddComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <mat-dialog-content>
        <mat-form-field class="w-full">
          <mat-label id="aria-label">{{ t(data.label) }}</mat-label>
          <input
            matInput
            [formControl]="name"
            data-testid="name-input"
            [placeholder]="data.placeholder ? t(data.placeholder) : ''"
          />
          @if (name.hasError("required")) {
            <mat-error
              data-testid="name-required-error"
              [innerHTML]="t(errorMessages!.required.message, errorMessages!.required.translocoParams)"
            ></mat-error>
          } @else if (name.hasError("maxlength")) {
            <mat-error
              data-testid="name-maxLength-error"
              [innerHTML]="t(errorMessages!.maxLength.message, errorMessages!.maxLength.translocoParams)"
            ></mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions class="!flex-nowrap gap-4">
        <app-button-close mat-dialog-close translocoKey="commons.cancel" />
        <app-button-add [translocoKey]="data.action" (click)="submit()" [disabled]="name.invalid" />
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(window:keyup.Enter)": "onPressEnter()",
  },
})
export class EnterNameDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EnterNameDialogComponent>);
  data = inject<NameDialogData>(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  readonly color = signal(Math.floor(Math.random() * (8 - 1) + 1));
  validators = this.data.validators || ([] as ValidatorConfig[]);
  name = this.fb.nonNullable.control(this.data.defaultValue || "", [
    ...this.validators.map((validator) => validator.validatorFn),
  ]);
  errorMessages = this.validators.reduce(
    (obj, item) => ((obj[item.type] = { message: item.message, translocoParams: item.translocoParams || {} }), obj),
    {} as Record<keyof typeof Validators, { message: string; translocoParams: TranslocoParams }>,
  );

  onPressEnter() {
    this.name.markAsTouched();
    this.submit();
  }

  submit() {
    if (this.name.valid) {
      this.dialogRef.close(this.name.value);
    }
  }
}
