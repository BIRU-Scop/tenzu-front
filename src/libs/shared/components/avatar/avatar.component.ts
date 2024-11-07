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

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

@Component({
  selector: "app-avatar",
  standalone: true,
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
    const chunks = this.name().split(" ").slice(0, 2);
    const tempName: string[] = [];
    let firstIsEmoji = false;
    chunks.forEach((chunk, i) => {
      if (this.isItAnEmoji(chunk) && i === 0) {
        tempName.push(chunk);
        firstIsEmoji = true;
      } else if (!this.isItAnEmoji(chunk) && !firstIsEmoji) {
        tempName.push(chunk[0]);
      }
    });
    return tempName.join("");
  });

  private isItAnEmoji(chunk: string) {
    const regexExp =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
    return regexExp.test(chunk);
  }
}
