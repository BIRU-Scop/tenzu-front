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
import { Component, computed, inject, input, signal } from "@angular/core";
import { MatError, MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";

import { Field, FieldTree } from "@angular/forms/signals";
import {
  DEFAULT_SETTINGS,
  getSeverity,
  hasLowercase,
  hasMinLength,
  hasNumber,
  hasSymbol,
  hasUppercase,
  PasswordSettings,
} from "@tenzu/shared/components/form/password-field/utils";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { PasswordStrengthComponent } from "@tenzu/shared/components/form/password-field/password-strength/password-strength.component";

@Component({
  selector: "app-password-field",
  styles: `
    .valid {
      color: var(--mat-sys-on-tertiary);
    }
  `,
  host: {
    class: "flex flex-col",
  },
  template: `
    @let _field = field();
    <ng-container *transloco="let t">
      <mat-form-field class="w-full">
        <mat-label>
          {{ t(label()) }}
        </mat-label>
        <input
          [type]="hide() ? 'password' : 'text'"
          matInput
          [field]="_field"
          autocomplete
          [placeholder]="t('component.password.placeholder')"
        />
        <mat-icon
          class="icon-sm"
          matSuffix
          [attr.aria-label]="t(hide() ? 'component.password.show' : 'component.password.hide')"
          (click)="hideRevealSwitch(); $event.stopPropagation()"
          >{{ hide() ? "visibility" : "visibility_off" }}
        </mat-icon>

        @if (_field().touched() && _field().invalid()) {
          <mat-error>
            @for (error of _field().errors(); track error; let first = $first) {
              @if (error.message && first) {
                {{ t(error.message) }}
              }
            }
          </mat-error>
        }
      </mat-form-field>
      @let _hints = hints();
      @let _settings = settings();
      @if (_settings.enabledStrength) {
        <ul class="mb-4">
          <li [class.valid]="_hints.valid.minLength" class="list-decimal list-inside">
            @if (_hints.valid.minLength) {
              <mat-icon class="align-middle">check</mat-icon>
            }
            {{ t("component.password.hints.minLength", { minLength: _hints.minLength }) }}
          </li>
          <li class="list-decimal list-inside">
            {{
              t("component.password.hints.diversity", {
                diversityDifference: _hints.numberDiversityDifference,
              })
            }}
            <ul class="ml-4">
              <li [class.valid]="_hints.valid.lowercase" class="list-disc list-inside">
                @if (_hints.valid.lowercase) {
                  <mat-icon class="align-middle">check</mat-icon>
                }
                {{ t("component.password.hints.lowercase") }}
              </li>
              <li [class.valid]="_hints.valid.uppercase" class="list-disc  list-inside">
                @if (_hints.valid.uppercase) {
                  <mat-icon class="align-middle">check</mat-icon>
                }
                {{ t("component.password.hints.uppercase") }}
              </li>
              <li [class.valid]="_hints.valid.number" class="list-disc  list-inside">
                @if (_hints.valid.number) {
                  <mat-icon class="align-middle">check</mat-icon>
                }
                {{ t("component.password.hints.number") }}
              </li>
              <li [class.valid]="_hints.valid.symbol" class="list-disc list-inside">
                @if (_hints.valid.symbol) {
                  <mat-icon class="align-middle">check</mat-icon>
                }
                {{ t("component.password.hints.symbol", { symbols: SYMBOLS }) }}
              </li>
            </ul>
          </li>
        </ul>
        @let _severity = severity();
        @if (settings().showStrengthBar) {
          <app-password-strength [severity]="_severity" />
        }
      }
    </ng-container>
  `,
  imports: [
    MatFormField,
    MatLabel,
    TranslocoDirective,
    MatInput,
    MatSuffix,
    Field,
    MatIcon,
    MatError,
    PasswordStrengthComponent,
  ],
})
export class PasswordFieldComponent {
  config = inject(ConfigAppService).config;
  field = input.required<FieldTree<string, string>>();
  label = input("component.password.label");
  autocomplete = input("current-password");
  settings = input(DEFAULT_SETTINGS, {
    transform: (settings: Partial<PasswordSettings>) => ({ ...DEFAULT_SETTINGS, ...settings }),
  });
  hide = signal(true);
  severity = computed(() => getSeverity(this.field()().value(), this.config()));
  hints = computed(() => {
    const value = this.field()().value();
    const security = this.config().security;

    return {
      minLength: security.password.minLength,
      numberDiversityDifference: security.password.numberDiversityDifference,
      valid: {
        minLength: hasMinLength(value, 8),
        lowercase: hasLowercase(value),
        uppercase: hasUppercase(value),
        number: hasNumber(value),
        symbol: hasSymbol(value),
      },
    };
  });

  hideRevealSwitch() {
    this.hide.update((value) => !value);
  }

  protected readonly SYMBOLS = SYMBOLS;
}
