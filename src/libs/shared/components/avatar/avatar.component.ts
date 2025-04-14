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

import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-avatar",
  standalone: true,
  styleUrl: "avatar.component.scss",
  encapsulation: ViewEncapsulation.None,
  template: `<div [class]="class()">
    <span>{{ initials() }}</span>
  </div> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  name = input("", {
    transform: (value: undefined | string) => value ?? "?",
  });
  color = input(0, {
    transform: (value: undefined | number) => value ?? 0,
  });
  rounded = input(false);
  size = input<"sm" | "md" | "lg" | "xl">("md");
  class = computed(() => [
    "avatar",
    "flex",
    "items-center",
    "justify-center",
    "uppercase",
    `color-${this.color()}`,
    `avatar-${this.size()}`,
    this.rounded() ? "rounded-full" : "rounded",
  ]);

  initials = computed(() => {
    const words = this.name().split(" ");
    let chunks: string;

    if (words.length > 1) {
      chunks = words[0].slice(0, 1) + words[1].slice(0, 1);
    } else {
      chunks = this.name().split("").slice(0, 2).join("");
    }
    return chunks;
  });
}
