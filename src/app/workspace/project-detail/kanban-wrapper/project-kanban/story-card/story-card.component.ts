/*
 * Copyright (C) 2024-2025 BIRU
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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { RouterLink } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { StorySummary } from "@tenzu/repository/story";
import { StoryAssigneeComponent } from "@tenzu/shared/components/story-assignee/story-assignee.component";

@Component({
  selector: "app-story-card",
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardContent,
    MatCardTitle,
    TranslocoDirective,
    StoryAssigneeComponent,
    MatCardActions,
  ],
  template: `
    @let _story = story();
    <mat-card appearance="outlined" class="h-full" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', _story.ref]" class="line-clamp-2 w-fit"
            ><span class="text-on-tertiary-container">#{{ _story.ref }}</span> {{ _story.title }}</a
          ></mat-card-title
        >
      </mat-card-header>
      <mat-card-content class="h-full"> </mat-card-content>
      <mat-card-actions>
        <app-story-assignee
          class="px-1"
          [story]="story()"
          [hasModifyPermission]="hasModifyPermission()"
        ></app-story-assignee>
      </mat-card-actions>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardComponent {
  story = input.required<Pick<StorySummary, "ref" | "title" | "projectId" | "assigneeIds">>();
  hasModifyPermission = input(false);
}
