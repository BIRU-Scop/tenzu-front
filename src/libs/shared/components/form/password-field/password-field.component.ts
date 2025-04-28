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
import { SYMBOLS } from "@tenzu/utils/functions/strings";
import { ChangeDetectionStrategy, Component, input, OnInit, signal } from "@angular/core";
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { PasswordStrengthComponent } from "./password-strength/password-strength.component";
import {
  DiversityEnum,
  DiversityType,
  getSeverity,
  PasswordRequirements,
  PasswordSettings,
  PasswordSeverity,
  stringDiversity,
} from "./password-strength/_utils";
import { AuthService } from "@tenzu/repository/auth";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor-directive.directive";
import { injectNgControl } from "@tenzu/utils/injectors";

type PasswordStrengthSignature = {
  severity: PasswordSeverity;
  diversity: DiversityType[];
  length: number;
};

const DEFAULT_STRENGTH: PasswordStrengthSignature = {
  severity: "none",
  diversity: [],
  length: 0,
};

const DEFAULT_STRENGTH_SETTINGS = { enabled: false, lengthSecureThreshold: 15, showBar: false };

const DEFAULT_SETTINGS: PasswordSettings = {
  strength: DEFAULT_STRENGTH_SETTINGS,
};

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  diversity: 3,
  minLength: 8,
  maxLength: 128,
};

@Component({
  selector: "app-password-field",
  providers: [{ provide: AuthService, useClass: PasswordStrengthComponent }],
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatIcon,
    MatLabel,
    MatSuffix,
    MatError,
    TranslocoDirective,
    PasswordStrengthComponent,
    MatHint,
  ],
  hostDirectives: [NoopValueAccessorDirective],
  template: `
    <mat-form-field *transloco="let t; prefix: 'component.password'">
      <mat-label>
        @if (settings().label) {
          {{ settings().label }}
        } @else {
          {{ t("label") }}
        }
      </mat-label>
      <input
        matInput
        required
        autocomplete
        data-testid="password-input"
        [type]="hide() ? 'password' : 'text'"
        [formControl]="ngControl.control"
        [placeholder]="t('placeholder')"
      />

      <mat-icon class="icon-sm" matSuffix [attr.aria-label]="t(hide() ? 'show' : 'hide')" (click)="hideRevealSwitch()"
        >{{ hide() ? "visibility" : "visibility_off" }}
      </mat-icon>
      @if (
        settings().strength.enabled &&
        strength() &&
        (ngControl.control.pristine || (!ngControl.control.pristine && ngControl.control.invalid))
      ) {
        <mat-hint>
          <ul>
            @if (
              strength().length < requirements().minLength || strength().diversity.length < requirements().diversity
            ) {
              @if (strength().length < requirements().minLength) {
                <li>{{ t("hints.minLength", { minLength: requirements().minLength }) }}</li>
              }
              @if (strength().diversity.length < requirements().diversity) {
                <li>
                  {{
                    t("hints.diversity", {
                      diversityDifference: requirements().diversity - strength().diversity.length,
                    })
                  }}
                  <ul class="list-disc">
                    @for (diversityType of _diversityTypes; track diversityType) {
                      @if (!strength().diversity.includes(diversityType)) {
                        <li>{{ t("hints.diversityType", { diversityType: diversityType }) }}</li>
                      }
                    }
                  </ul>
                </li>
              }
            }
            <li [innerHTML]="t('hints.symbolCharacters', { symbols: SYMBOLS })"></li>
          </ul>
        </mat-hint>
      }
      @if (ngControl.control.hasError("required")) {
        <mat-error
          [innerHTML]="t('errors.required', { label: settings().label || t('label') })"
          data-testid="password-required-error"
        ></mat-error>
      } @else if (ngControl.control.errors && settings().strength.enabled) {
        <mat-error>
          <ul>
            @if (ngControl.control.hasError("minLength")) {
              <li
                [innerHTML]="
                  t('errors.minLength', {
                    number: ngControl.control.errors['minLength']['required'],
                  })
                "
              ></li>
            } @else if (ngControl.control.hasError("maxLength")) {
              <li
                [innerHTML]="
                  t('errors.maxLength', {
                    number: ngControl.control.errors['maxLength']['required'],
                  })
                "
              ></li>
            }
            @if (ngControl.control.hasError("diversity")) {
              <li>
                <span
                  [innerHTML]="
                    t('errors.diversity', {
                      diversityDifference:
                        ngControl.control.errors['diversity']['required'] -
                        ngControl.control.errors['diversity']['current'],
                    })
                  "
                ></span>
                <ul class="list-disc">
                  @for (
                    lackingType of Object.values(ngControl.control.errors["diversity"]["lacks"]);
                    track lackingType
                  ) {
                    <li [innerHTML]="t('errors.diversityType', { diversityType: lackingType })"></li>
                  }
                </ul>
              </li>
              <li [innerHTML]="t('hints.symbolCharacters', { symbols: SYMBOLS })"></li>
            }
          </ul>
        </mat-error>
      }
    </mat-form-field>
    @if (settings().strength.showBar && strength().severity !== "none") {
      <app-password-strength [severity]="strength().severity"></app-password-strength>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordFieldComponent implements OnInit {
  _diversityTypes: DiversityType[] = Object.keys(DiversityEnum) as DiversityType[];
  ngControl = injectNgControl();
  hide = signal(true);

  settings = input(DEFAULT_SETTINGS, {
    transform: (settings: PasswordSettings) => this.validateSettings(settings),
  });
  validateSettings(settings: PasswordSettings): PasswordSettings {
    const strengthSettings = { ...DEFAULT_STRENGTH_SETTINGS, ...(settings.strength ?? {}) };
    const resultSettings = { ...settings, strength: strengthSettings };
    if (!resultSettings.strength.enabled && resultSettings.strength.showBar) {
      throw Error(
        `[PASSWORD][SETTINGS] Invalid showBar settings: strength setting needs to be enabled with showBar to work.`,
      );
    }
    return resultSettings;
  }

  requirements = input(DEFAULT_REQUIREMENTS, {
    transform: (requirements: Partial<PasswordRequirements>) => this.validateRequirements(requirements),
  });
  validateRequirements(requirements: Partial<PasswordRequirements>) {
    const resultRequirements = { ...DEFAULT_REQUIREMENTS, ...requirements };
    const _backendMinDiversity = 3;
    const _backendMinLength = 8;
    const _backendMaxLength = 128;

    if (resultRequirements.diversity < _backendMinDiversity) {
      throw Error(
        `[PASSWORD][REQUIREMENTS] Invalid diversity requirement: {min: ${_backendMinDiversity}$ current: ${resultRequirements.diversity}}`,
      );
    }
    if (resultRequirements.minLength < _backendMinLength) {
      throw Error(
        `[PASSWORD][REQUIREMENTS] Invalid minLength requirement: {min: ${_backendMinLength}$ current: ${resultRequirements.minLength}}`,
      );
    }
    if (resultRequirements.maxLength > _backendMaxLength) {
      throw Error(
        `[PASSWORD][REQUIREMENTS] Invalid maxLength requirement: {max: ${_backendMaxLength}$ current: ${resultRequirements.maxLength}}`,
      );
    }

    return resultRequirements;
  }

  ngOnInit() {
    this.ngControl.control.addValidators(this.requirementsValidator(this.requirements()));

    this.ngControl.control.valueChanges.subscribe(() => {
      let result = DEFAULT_STRENGTH;
      if (this.settings().strength.enabled) {
        result = this.getStrength(this.ngControl.value);
      }
      this.strength.set(result);
    });
  }

  hideRevealSwitch() {
    this.hide.update((value) => !value);
  }

  requirementsValidator(requirements: PasswordRequirements): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.settings().strength.enabled) {
        return null;
      }
      const validate = (password: string) => {
        const diversity = stringDiversity(password);
        const errors: Record<string, object> = {};
        if (diversity.length < requirements.diversity) {
          errors["diversity"] = {
            current: diversity.length,
            required: requirements.diversity,
            has: diversity,
            lacks: this._diversityTypes.filter((type) => diversity.indexOf(type) < 0),
          };
        }
        if (password.length < requirements.minLength) {
          errors["minLength"] = { current: password.length, required: requirements.minLength };
        }
        if (password.length > requirements.maxLength) {
          errors["maxLength"] = { current: password.length, required: requirements.maxLength };
        }
        return errors;
      };

      const errors = validate(control.value);

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  //STRENGTH RELATED

  strength = signal<PasswordStrengthSignature>(DEFAULT_STRENGTH);

  getStrength(password: string): PasswordStrengthSignature {
    const severity = getSeverity(password, this.settings(), this.requirements());
    return {
      severity: severity,
      diversity: stringDiversity(password),
      length: password.length,
    };
  }

  protected readonly Object = Object;
  protected readonly SYMBOLS = SYMBOLS;
}
