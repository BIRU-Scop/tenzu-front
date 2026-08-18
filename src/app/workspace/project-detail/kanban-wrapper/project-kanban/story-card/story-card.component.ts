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

import { Component, computed, inject, input } from "@angular/core";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatChipSet } from "@angular/material/chips";
import { RouterLink } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { StorySummary } from "@tenzu/repository/story/story.model";
import { StoryTagRepositoryService } from "@tenzu/repository/story-tag/story-tag-repository.service";
import { MatTooltip } from "@angular/material/tooltip";
import { StoryAssigneeComponent } from "@tenzu/shared/components/story-assignee/story-assignee.component";
import { StoryTagChipComponent } from "@tenzu/shared/components/story-tag-chip/story-tag-chip.component";

const MAX_VISIBLE_TAGS = 3;

@Component({
  selector: "app-story-card",
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardTitle,
    TranslocoDirective,
    StoryAssigneeComponent,
    MatCardActions,
    MatCardContent,
    MatChipSet,
    MatTooltip,
    StoryTagChipComponent,
  ],
  template: `
    @let _story = story();
    <mat-card appearance="outlined" class="mat-bg-surface h-full" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', _story.ref]" class="line-clamp-2 w-fit "
            >#{{ _story.ref }} {{ _story.title }}</a
          ></mat-card-title
        >
      </mat-card-header>
      @if (visibleTags().length > 0) {
        <mat-card-content class="!py-1">
          <div class="flex flex-row items-center gap-1">
            <mat-chip-set class="story-card-tags min-w-0 overflow-hidden">
              @for (tag of visibleTags(); track tag.id) {
                <app-story-tag-chip [tag]="tag" />
              }
            </mat-chip-set>
            @if (hiddenTags().length > 0) {
              <span
                class="shrink-0 mat-label-medium text-on-surface-variant"
                [attr.aria-label]="hiddenTagsLabel()"
                [matTooltip]="hiddenTagsLabel()"
                >+{{ hiddenTags().length }}</span
              >
            }
          </div>
        </mat-card-content>
      }
      <mat-card-actions class="!mt-auto">
        <app-story-assignee class="px-1" [story]="story()" [hasModifyPermission]="hasModifyPermission()" />
      </mat-card-actions>
    </mat-card>
  `,
  styles: ``,
})
export class StoryCardComponent {
  private storyTagRepositoryService = inject(StoryTagRepositoryService);

  story = input.required<Pick<StorySummary, "ref" | "title" | "projectId" | "assigneeIds" | "tagIds">>();
  hasModifyPermission = input(false);

  private assignedTags = computed(() => {
    const tagsById = this.storyTagRepositoryService.entityMapSummary();
    return this.story()
      .tagIds.map((tagId) => tagsById[tagId])
      .filter((tag) => tag !== undefined);
  });

  protected visibleTags = computed(() => this.assignedTags().slice(0, MAX_VISIBLE_TAGS));
  protected hiddenTags = computed(() => this.assignedTags().slice(MAX_VISIBLE_TAGS));
  protected hiddenTagsLabel = computed(() =>
    this.hiddenTags()
      .map((tag) => tag.label)
      .join(", "),
  );
}
