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
    selector: "app-story-skeleton",
    imports: [],
    template: `
    <div class="flex flex-col gap-4 skeleton-container">
      <div class="grow flex flex-col gap-y-2">
        <div class="skeleton-line skeleton-line-md"></div>
        <div class="skeleton-line skeleton-line-md"></div>
      </div>
      <div class="flex flex-row">
        <div class="skeleton-avatar skeleton-avatar-heavy"></div>
        <div class="skeleton-avatar skeleton-avatar-medium"></div>
        <div class="skeleton-avatar skeleton-avatar-light"></div>
      </div>
    </div>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StorySkeletonComponent {}
