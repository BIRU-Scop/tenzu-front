import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { MatFormField, MatLabel, MatSuffix, MatError } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from "@angular/forms";
import { injectNgControl } from "@tenzu/utils";
import { JsonPipe } from "@angular/common";
import { TranslocoDirective } from "@jsverse/transloco";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor-directive.directive";
import { emailRegexPatternValidation } from "@tenzu/shared/components/form/email-field/utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NoopValueAccessorDirective],
  imports: [
    MatLabel,
    MatIcon,
    MatSuffix,
    MatIconButton,
    MatInput,
    ReactiveFormsModule,
    JsonPipe,
    TranslocoDirective,
    MatFormField,
    MatError,
    MatLabel,
  ],
  providers: [],
  selector: "app-email-field",
  standalone: true,
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
