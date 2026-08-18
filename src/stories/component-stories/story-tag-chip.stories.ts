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

import { Meta, moduleMetadata, StoryObj } from "@storybook/angular-vite";

import { Component, signal } from "@angular/core";
import { MatChipSet } from "@angular/material/chips";
import { withTransloco } from "../storybook-providers";
import { StoryTagChipComponent } from "@tenzu/shared/components/story-tag-chip/story-tag-chip.component";
import { StoryTag, TAG_COLOR_COUNT } from "@tenzu/repository/story-tag/story-tag.model";

const TAGS: StoryTag[] = Array.from({ length: TAG_COLOR_COUNT }, (_, index) => ({
  id: `tag-${index + 1}`,
  label: `Color ${index + 1}`,
  color: index + 1,
}));

const LONG_LABEL_TAG: StoryTag = {
  id: "tag-long",
  label: "a very long tag label that reaches the fifty chars",
  color: 5,
};

@Component({
  selector: "app-story-tag-chip-storybook",
  standalone: true,
  imports: [StoryTagChipComponent, MatChipSet],
  template: `
    <div class="flex flex-col gap-8">
      @for (scheme of schemes; track scheme) {
        <section
          class="flex flex-col gap-4 rounded-lg p-6"
          [style.color-scheme]="scheme"
          style="background-color: var(--mat-sys-surface); color: var(--mat-sys-on-surface)"
        >
          <h1>tag chips - {{ scheme }}</h1>
          <mat-chip-set class="flex flex-row flex-wrap items-center gap-2">
            @for (tag of tags; track tag.id) {
              <app-story-tag-chip [tag]="tag" />
            }
          </mat-chip-set>

          <h1>removable tag chips - {{ scheme }}</h1>
          <mat-chip-set class="flex flex-row flex-wrap items-center gap-2">
            @for (tag of removableTags(); track tag.id) {
              <app-story-tag-chip [tag]="tag" [removable]="true" (removed)="removeTag(tag)" />
            }
          </mat-chip-set>

          <h1>long label - {{ scheme }}</h1>
          <div class="w-48">
            <app-story-tag-chip [tag]="longLabelTag" />
          </div>
        </section>
      }
    </div>
  `,
})
class StoryStoryTagChipStorybookComponent {
  readonly schemes = ["light", "dark"] as const;
  readonly tags = TAGS;
  readonly longLabelTag = LONG_LABEL_TAG;
  readonly removableTags = signal<StoryTag[]>(TAGS);

  removeTag(tag: StoryTag) {
    this.removableTags.update((tags) => tags.filter((currentTag) => currentTag.id !== tag.id));
  }
}

type Story = StoryObj<StoryStoryTagChipStorybookComponent>;

const meta: Meta<StoryStoryTagChipStorybookComponent> = {
  component: StoryStoryTagChipStorybookComponent,
  title: "Components/StoryTagChip",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-story-tag-chip-storybook />`,
  }),
};
