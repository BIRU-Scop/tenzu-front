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

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, computed, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatChipGrid } from "@angular/material/chips";
import { MatOption } from "@angular/material/core";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import { StoryDetail } from "@tenzu/repository/story/story.model";
import { StoryTagRepositoryService } from "@tenzu/repository/story-tag/story-tag-repository.service";
import { StoryTag } from "@tenzu/repository/story-tag/story-tag.model";
import { StoryTagChipComponent } from "../story-tag-chip/story-tag-chip.component";

@Component({
  selector: "app-story-tags",
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    StoryTagChipComponent,
    TranslocoDirective,
    MatChipGrid,
  ],
  template: `
    <div class="flex flex-col gap-2" *transloco="let t">
      <mat-chip-grid class="flex flex-row flex-wrap items-center gap-1">
        @for (tag of assignedTags(); track tag.id) {
          <app-story-tag-chip [tag]="tag" [removable]="hasModifyPermission()" (removed)="unassignTag(tag)" />
        }
      </mat-chip-grid>
      @if (hasModifyPermission()) {
        @if (!hasProjectTags()) {
          <p class="mat-body-small text-on-surface-variant">{{ t("component.story_tags.no_tags") }}</p>
        } @else {
          <mat-form-field class="w-56" subscriptSizing="dynamic">
            <mat-label>{{ t("component.story_tags.input_label") }}</mat-label>
            <input matInput #tagInput [(ngModel)]="searchText" [matAutocomplete]="tagsAutocomplete" />
            <mat-autocomplete #tagsAutocomplete (optionSelected)="onTagSelected($event); tagInput.value = ''">
              @for (tag of availableTags(); track tag.id) {
                <mat-option [value]="tag.id">{{ tag.label }}</mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
        }
      }
    </div>
  `,
})
export class StoryTagsComponent {
  private storyTagRepositoryService = inject(StoryTagRepositoryService);
  private storyRepositoryService = inject(StoryRepositoryService);
  private liveAnnouncer = inject(LiveAnnouncer);
  private translocoService = inject(TranslocoService);

  story = input.required<StoryDetail>();
  hasModifyPermission = input(false);

  protected searchText = signal("");

  protected hasProjectTags = computed(() => this.storyTagRepositoryService.entitiesSummary().length > 0);

  protected assignedTags = computed(() => {
    const tagsById = this.storyTagRepositoryService.entityMapSummary();
    return this.story()
      .tagIds.map((tagId) => tagsById[tagId])
      .filter((tag) => tag !== undefined);
  });

  protected availableTags = computed(() => {
    const assignedTagIds = new Set(this.story().tagIds);
    const search = this.searchText().trim().toLowerCase();

    return this.storyTagRepositoryService
      .entitiesSummary()
      .filter((tag) => !assignedTagIds.has(tag.id) && tag.label.toLowerCase().includes(search));
  });

  protected async onTagSelected(event: MatAutocompleteSelectedEvent) {
    const story = this.story();
    const tagId = event.option.value as StoryTag["id"];
    event.option.deselect();
    this.searchText.set("");
    const storyTagAssign = await this.storyRepositoryService.createTagAssign(tagId, {
      projectId: story.projectId,
      ref: story.ref,
    });
    void this.liveAnnouncer.announce(
      this.translocoService.translate("component.story_tags.tag_added", { label: storyTagAssign.tag.label }),
    );
  }

  protected async unassignTag(tag: StoryTag) {
    const story = this.story();
    await this.storyRepositoryService.deleteTagAssign(tag.id, { projectId: story.projectId, ref: story.ref });
    void this.liveAnnouncer.announce(
      this.translocoService.translate("component.story_tags.tag_removed", { label: tag.label }),
    );
  }
}
