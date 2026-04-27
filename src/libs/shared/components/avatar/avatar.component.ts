/*
 * Copyright (C) 2024-2026 BIRU
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

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

export type AvatarMode = "outlined" | "filled-circle" | "filled-square";
export type AvatarSize = "sm" | "md" | "lg" | "xl";

@Component({
  selector: "app-avatar",
  standalone: true,
  host: {
    "[class]": "hostClasses()",
    "[style.color]": "textColor()",
    "[style.background-color]": "backgroundColor()",
    "[style.border-color]": "borderColor()",
  },
  template: `
    @let _imageData = imageData();
    @if (_imageData) {
      <img loading="lazy" [src]="_imageData" [alt]="initials()" />
    } @else {
      <span>{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      @apply tracking-widest flex items-center justify-center uppercase;
      color: var(--mat-sys-on-surface);

      &.avatar-sm {
        @apply text-xs w-6 h-6;
      }
      &.avatar-md {
        @apply text-sm w-8 h-8;
      }
      &.avatar-lg {
        @apply text-lg w-12 h-12;
      }
      &.avatar-xl {
        @apply text-lg w-16 h-16;
      }

      &.mode-outlined {
        background-color: transparent;
        border: 1px solid var(--mat-sys-outline);
        @apply rounded-full;
      }

      &.mode-filled-circle {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        @apply rounded-full;
      }

      &.mode-filled-square {
        background-color: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        @apply rounded;
      }

      & img {
        @apply w-full h-full object-cover;
      }

      &.mode-outlined img,
      &.mode-filled-circle img {
        @apply rounded-full;
      }

      &.mode-filled-square img {
        @apply rounded;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  name = input("", {
    transform: (value: undefined | string) => value ?? "?",
  });
  mode = input<AvatarMode>("filled-circle");
  size = input<AvatarSize>("md");
  imageData = input<string | ArrayBuffer | null | undefined>(null);

  textColor = input<string | undefined>(undefined);
  backgroundColor = input<string | undefined>(undefined);
  borderColor = input<string | undefined>(undefined);

  hostClasses = computed(() => ["avatar", `avatar-${this.size()}`, `mode-${this.mode()}`].join(" "));

  initials = computed(() => {
    const words = this.name()
      .split(" ")
      .filter((w) => w.length > 0);

    if (words.length === 0) {
      return "";
    }

    const first = [...words[0]][0];

    // If the first letter is an emoji, return only the emoji
    if (/\p{Extended_Pictographic}/u.test(first)) {
      return first;
    }

    if (words.length === 1) {
      return [...words[0]].slice(0, 2).join("");
    }

    const second = [...words[1]][0];
    // If the second letter is an emoji, ignore it
    if (/\p{Extended_Pictographic}/u.test(second)) {
      return first;
    }
    return first + second;
  });
}
