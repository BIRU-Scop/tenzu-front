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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatButton, MatButtonAppearance, MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { TitleCasePipe } from "@angular/common";
import { LevelType, IconName, ButtonType } from "../ui.types";
import { ButtonInterface } from "./button.interface";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: "app-button",
  imports: [MatButton, TranslocoDirective, MatIconButton, MatIcon, TitleCasePipe, MatTooltip],
  template: `
    @let _translocoKey = translocoKey();
    @let _iconName = iconName();

    @switch (iconOnly()) {
      @case (true) {
        <button
          *transloco="let t"
          [class]="level()"
          matIconButton
          [attr.aria-label]="t(_translocoKey)"
          [disabled]="disabled()"
          [matTooltip]="t(_translocoKey)"
        >
          <mat-icon>{{ _iconName }}</mat-icon>
        </button>
      }
      @default {
        <button
          *transloco="let t"
          class="w-full"
          [matButton]="appearance()"
          [type]="type()"
          [class]="level()"
          [disabled]="disabled()"
        >
          @if (_iconName) {
            <mat-icon>{{ _iconName }}</mat-icon>
          }
          {{ t(_translocoKey) | titlecase }}
        </button>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements ButtonInterface {
  level = input.required({
    transform: (value: LevelType) => {
      switch (value) {
        case "primary":
          return "primary-button";
        case "secondary":
          return "secondary-button";
        case "tertiary":
          return "tertiary-button";
        case "warning":
          return "warning-button";
        case "error":
          return "error-button";
        default:
          throw new Error("value not allowed");
      }
    },
  });
  appearance = input<MatButtonAppearance>("filled");
  translocoKey = input.required<string>();
  type = input<ButtonType>("button");
  iconName = input<IconName | undefined>(undefined);
  iconOnly = input<boolean>(false);
  disabled = input<boolean>(false);
}
