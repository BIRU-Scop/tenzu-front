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

import { Pipe, PipeTransform } from "@angular/core";

export const COLORS: Record<number, string> = {
  1: "#4A90E2", // Soft Blue
  2: "#2ECC71", // Emerald
  3: "#9B59B6", // Amethyst
  4: "#FF6F61", // Coral
  5: "#F1C40F", // Sunflower
  6: "#1ABC9C", // Turquoise
  7: "#E67E22", // Burnt Orange
  8: "#D81B60", // Raspberry Pink
  9: "#34495E", // Slate
};

@Pipe({
  name: "colorToKey",
  standalone: true,
})
export class ColorToKeyPipe implements PipeTransform {
  transform(hexColor: string | null | undefined): number {
    if (!hexColor) {
      return 1;
    }
    const entry = Object.entries(COLORS).find(([, value]) => value.toLowerCase() === hexColor.toLowerCase());
    return entry ? Number(entry[0]) : 1;
  }
}
