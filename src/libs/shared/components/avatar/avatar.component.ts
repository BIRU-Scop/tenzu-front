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

import { Component, computed, input } from "@angular/core";

export type AvatarMode = "outlined" | "filled-circle" | "filled-square";
export type AvatarSize = "sm" | "md" | "lg" | "xl";

@Component({
  selector: "app-avatar",
  standalone: true,
  host: {
    "[class]": "hostClasses()",
    "[style.color]": "computeColor()",
    "[style.background-color]": "computedBackgroundColor()",
    "[style.border-color]": "computedBorderColor()",
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
      @apply tracking-widest flex items-center justify-center uppercase shrink-0;
      aspect-ratio: 1;
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
        border: 1px solid;
        @apply rounded-full;
      }

      &.mode-filled-circle {
        @apply rounded-full;
      }

      &.mode-filled-square {
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
})
export class AvatarComponent {
  name = input("", {
    transform: (value: undefined | string) => value ?? "?",
  });
  mode = input<AvatarMode>("filled-circle");
  size = input<AvatarSize>("md");
  imageData = input<string | ArrayBuffer | null | undefined>(null);
  textColor = input<string | undefined>(undefined);
  color = input<number | string>(1);

  computedBackgroundColor = computed(() => {
    const color = this.color();

    const mode = this.mode();
    if (mode === "filled-circle" || mode === "filled-square") {
      return `var(--color-${color}-background)`;
    } else {
      return "transparent";
    }
  });
  computeColor = computed(() => {
    const color = this.color();
    return `var(--color-${color}-color)`;
  });
  computedBorderColor = computed(() => {
    const color = this.color();
    const mode = this.mode();
    if (mode === "outlined") {
      return `var(--color-${color}-color)`;
    } else {
      return `var(--color-${color}-border)`;
    }
  });
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
