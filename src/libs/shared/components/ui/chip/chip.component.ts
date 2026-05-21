/*
 * Copyright (C) 2025-2026 BIRU
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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { IconName, LevelType } from "../ui.types";
import { ChipInterface } from "./chip.interface";
import { JsonObject } from "@tenzu/repository/base/misc.model";
import {
  MatChip,
  MatChipAvatar,
  MatChipEvent,
  MatChipOption,
  MatChipRemove,
  MatChipSelectionChange,
} from "@angular/material/chips";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: "app-chip",
  host: {
    class: "inline-flex",
    "[style.pointer-events]": "disabled() ? 'none' : 'auto'",
  },
  imports: [MatChip, MatChipOption, MatIcon, MatChipAvatar, MatChipRemove, TranslocoDirective, MatTooltip],
  template: `
    @let _iconName = iconName();
    @let _disabled = disabled();
    @let _deletable = deletable();
    <ng-container *transloco="let t">
      @let _label = t(translocoKey(), translocoValue());
      @let _removeLabel = t("chip.remove_action", { label: _label });
      @switch (variant()) {
        @case ("option") {
          <mat-chip-option
            (removed)="removed.emit($event)"
            [class]="level()"
            [disabled]="_disabled"
            [selected]="selected()"
            (selectionChange)="selectionChange.emit($event)"
          >
            @if (_iconName) {
              <mat-icon aria-hidden="true" matChipAvatar>{{ _iconName }}</mat-icon>
            }
            {{ _label }}
            @if (_deletable) {
              <button
                type="button"
                matChipRemove
                [attr.aria-label]="_removeLabel"
                [disabled]="_disabled"
                [matTooltip]="_removeLabel"
              >
                <mat-icon aria-hidden="true">close</mat-icon>
              </button>
            }
          </mat-chip-option>
        }
        @default {
          <mat-chip (removed)="removed.emit($event)" [class]="level()" [disabled]="_disabled">
            @if (_iconName) {
              <mat-icon aria-hidden="true" matChipAvatar>{{ _iconName }}</mat-icon>
            }
            {{ _label }}
            @if (_deletable) {
              <button
                type="button"
                matChipRemove
                [attr.aria-label]="_removeLabel"
                [disabled]="_disabled"
                [matTooltip]="_removeLabel"
              >
                <mat-icon aria-hidden="true">close</mat-icon>
              </button>
            }
          </mat-chip>
        }
      }
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent implements ChipInterface {
  level = input.required({
    transform: (value: LevelType) => {
      switch (value) {
        case "plain":
          return "";
        case "primary":
          return "primary-chip";
        case "secondary":
          return "secondary-chip";
        case "tertiary":
          return "tertiary-chip";
        case "warning":
          return "warning-chip";
        case "error":
          return "error-chip";
        case "success":
          return "success-chip";
        default:
          throw new Error("value not allowed");
      }
    },
  });
  translocoKey = input.required<string>();
  translocoValue = input<JsonObject>({});
  iconName = input<IconName | undefined>(undefined);
  disabled = input<boolean>(false);
  deletable = input<boolean>(false);
  variant = input<"chip" | "option">("chip");
  selected = input<boolean>(false);
  removed = output<MatChipEvent>();
  selectionChange = output<MatChipSelectionChange>();
}
