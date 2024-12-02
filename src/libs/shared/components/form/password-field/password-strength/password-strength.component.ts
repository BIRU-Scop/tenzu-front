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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { PasswordSeverity } from "./_utils";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-password-strength",
  imports: [TranslocoDirective],
  styleUrl: "./password-strength.component.scss",
  template: `@if (severity()) {
    <div
      class="flex flex-row items-center gap-x-2"
      [class]="severity()"
      aria-live="polite"
      *transloco="let t; prefix: 'component.password.password-strength'"
    >
      <div class="flex gap-x-2">
        <div class="bar-part one"></div>
        <div class="bar-part two"></div>
        <div class="bar-part three"></div>
      </div>
      @if (severity() !== "none") {
        <p class="mat-body-small">{{ t("security_level." + severity()) }}</p>
      }
    </div>
  }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStrengthComponent {
  severity = input<PasswordSeverity>();
}
