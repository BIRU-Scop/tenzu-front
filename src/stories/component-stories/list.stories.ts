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

import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemIcon,
  MatListItemLine,
  MatListItemTitle,
  MatListOption,
  MatSelectionList,
} from "@angular/material/list";

import { MatIcon } from "@angular/material/icon";
import { withTransloco } from "../storybook-providers";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: "app-list-storybook",
  standalone: true,
  imports: [
    CommonModule,
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemIcon,
    MatListItemLine,
    MatListItemTitle,
    MatIcon,
    AvatarComponent,
    CdkDropList,
    CdkDrag,
    MatListOption,
    MatSelectionList,
  ],
  template: `
    <div class="flex flex-col gap-8">
      <h1>Headline only</h1>
      <mat-selection-list>
        <mat-list-option togglePosition="before">
          <div matListItemTitle>Headline</div>
        </mat-list-option>
      </mat-selection-list>
      <mat-list>
        <mat-list-item>
          <div matListItemTitle>Headline</div>
        </mat-list-item>
        <mat-list-item>
          <mat-icon matListItemIcon>person</mat-icon>
          <div matListItemTitle>Headline</div>
        </mat-list-item>

        <mat-list-item>
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
        </mat-list-item>
      </mat-list>

      <h1>Headline + short supporting text</h1>
      <mat-selection-list [multiple]="false">
        <mat-list-option togglePosition="before">
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-option>
      </mat-selection-list>
      <mat-selection-list [multiple]="true">
        <mat-list-option togglePosition="before">
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-option>
      </mat-selection-list>
      <mat-list>
        <mat-list-item>
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-item>

        <mat-list-item>
          <mat-icon matListItemIcon>person</mat-icon>
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-item>

        <mat-list-item>
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-item>
      </mat-list>

      <h1>Headline + long multi-line supporting text</h1>

      <mat-list>
        <mat-list-item [lines]="3">
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Supporting text that is long enough to fill up multiple lines.</div>
        </mat-list-item>

        <mat-list-item [lines]="3">
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Supporting text that is long enough to fill up multiple lines.</div>
        </mat-list-item>
      </mat-list>

      <h1>Trailing checkbox</h1>
      <mat-selection-list>
        <mat-list-option>
          <div matListItemTitle>Headline</div>
        </mat-list-option>

        <mat-list-option>
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
        </mat-list-option>

        <mat-list-option>
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Short supporting text</div>
        </mat-list-option>
      </mat-selection-list>

      <h1>Combined leading (radio + person icon + avatar)</h1>
      <mat-list>
        <mat-list-item [lines]="3">
          <mat-icon matListItemIcon>person_add</mat-icon>
          <app-avatar matListItemAvatar name="Gigi Gray" mode="filled-circle" size="sm" />
          <div matListItemTitle>Headline</div>
          <div matListItemLine>Supporting text that is long enough to fill up multiple lines.</div>
        </mat-list-item>
      </mat-list>

      <h1>Draggable</h1>
      <mat-list cdkDropList (cdkDropListDropped)="drop($event)">
        @for (member of members(); track member.name) {
          <mat-list-item cdkDrag>
            <app-avatar matListItemAvatar [name]="member.name" mode="filled-circle" size="sm" />
            <div matListItemTitle>{{ member.name }}</div>
            <div matListItemLine>{{ member.role }}</div>
          </mat-list-item>
        }
      </mat-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryListStorybookComponent {
  readonly members = signal<{ name: string; role: string }[]>([
    { name: "Gigi Gray", role: "Product designer" },
    { name: "Ayla Yilmaz", role: "Frontend engineer" },
    { name: "Bo Chen", role: "Backend engineer" },
    { name: "Mira Patel", role: "Project manager" },
  ]);

  drop(event: CdkDragDrop<unknown>) {
    this.members.update((items) => {
      const next = [...items];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }
}

type Story = StoryObj<StoryListStorybookComponent>;

const meta: Meta<StoryListStorybookComponent> = {
  component: StoryListStorybookComponent,
  title: "Components/Components/List",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-list-storybook />`,
  }),
};
