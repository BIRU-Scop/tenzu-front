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
import { StatusSkeletonComponent } from "./status-skeleton/status-skeleton.component";
import { StorySkeletonComponent } from "./story-skeleton/story-skeleton.component";

@Component({
    selector: "app-project-kanban-skeleton",
    imports: [StatusSkeletonComponent, StorySkeletonComponent],
    template: `
    <div class="flex flex-row gap-x-8">
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
    </div>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectKanbanSkeletonComponent {}
