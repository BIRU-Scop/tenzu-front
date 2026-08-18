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

import { Component, computed, input, output } from "@angular/core";
import { MatChipRemove, MatChipRow } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { TranslocoDirective } from "@jsverse/transloco";
import { StoryTag, TAG_COLOR_COUNT } from "@tenzu/repository/story-tag/story-tag.model";
import { MatIconButton } from "@angular/material/button";

const TAG_COLOR_CLASSES: Record<StoryTag["color"], string> = Object.fromEntries(
  Array.from({ length: TAG_COLOR_COUNT }, (_, index) => [index + 1, `tag-color-${index + 1}`]),
);

@Component({
  selector: "app-story-tag-chip",
  imports: [MatChipRemove, MatIcon, MatTooltip, TranslocoDirective, MatChipRow, MatIconButton],
  template: `
    <ng-container *transloco="let t">
      @let _tag = tag();
      @if (noChip()) {
        <div [class]="colorClass() + ' flex flex-row items-center gap-4'">
          <div aria-hidden="true" class="inline-block bg-[var(--tag-background)] size-9 mat-corner-xs"></div>
          <div>{{ _tag.label }}</div>
        </div>
      } @else {
        @let removeLabel = t("chip.remove_action", { label: _tag.label });
        <mat-chip-row [class]="colorClass()" (removed)="removed.emit()">
          {{ _tag.label }}
          @if (removable()) {
            <button
              matIconButton
              type="button"
              matChipRemove
              [attr.aria-label]="removeLabel"
              [matTooltip]="removeLabel"
            >
              <mat-icon aria-hidden="true">close</mat-icon>
            </button>
          }
        </mat-chip-row>
      }
    </ng-container>
  `,
})
export class StoryTagChipComponent {
  tag = input.required<StoryTag>();
  removable = input(false);
  removed = output<void>();
  noChip = input(false);

  protected colorClass = computed(() => TAG_COLOR_CLASSES[this.tag().color]);
}
