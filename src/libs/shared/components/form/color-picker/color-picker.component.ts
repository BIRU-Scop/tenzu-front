/*
 * Copyright (C) 2026 BIRU
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

import { Component, model } from "@angular/core";
import { FormValueControl } from "@angular/forms/signals";
import { MatRadioButton, MatRadioChange, MatRadioGroup } from "@angular/material/radio";
import { TranslocoDirective } from "@jsverse/transloco";
import { TAG_COLOR_COUNT } from "@tenzu/repository/story-tag/story-tag.model";

@Component({
  selector: "app-color-picker",
  imports: [MatRadioGroup, MatRadioButton, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <mat-radio-group
        class="color-picker-grid  grid w-fit grid-cols-5 gap-2 overflow-hidden"
        [value]="value()"
        (change)="onSelectionChange($event)"
      >
        @for (swatch of swatches; track swatch.value) {
          <mat-radio-button
            [value]="swatch.value"
            [class]="swatch.colorClass"
            [aria-label]="t('component.color_picker.color_name', { index: swatch.value })"
          >
            <span
              aria-hidden="true"
              class="flex size-9 items-center justify-center bg-[var(--tag-background)] mat-corner-xs"
            ></span>
          </mat-radio-button>
        }
      </mat-radio-group>
    </ng-container>
  `,
})
export class ColorPickerComponent implements FormValueControl<number> {
  value = model(1);

  protected readonly swatches = Array.from({ length: TAG_COLOR_COUNT }, (_, index) => ({
    value: index + 1,
    colorClass: `tag-color-${index + 1}`,
  }));

  protected onSelectionChange(event: MatRadioChange<number>) {
    this.value.set(event.value);
  }
}
