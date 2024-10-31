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

import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-card-skeleton",
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col gap-4 skeleton-container">
      <div class="flex gap-4">
        <div class="skeleton-image"></div>
        <div class="grow flex flex-col gap-1 justify-center">
          <div class="skeleton-line skeleton-line-md"></div>
          <div class="skeleton-line skeleton-line-md"></div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="skeleton-line skeleton-line-sm"></div>
        <div class="skeleton-line skeleton-line-sm"></div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeletonComponent {}
