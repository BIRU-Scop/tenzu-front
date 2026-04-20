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

import { MatChipListbox, MatChipSet } from "@angular/material/chips";
import { withTransloco } from "../storybook-providers";
import { ChipComponent } from "@tenzu/shared/components/ui/chip/chip.component";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { LevelType } from "@tenzu/shared/components/ui/ui.types";

const LEVELS: LevelType[] = ["plain", "primary", "secondary", "tertiary", "warning", "error", "success"];

@Component({
  selector: "app-chips-storybook",
  standalone: true,
  imports: [ChipComponent, MatChipSet, MatChipListbox, CdkDropList, CdkDrag],
  template: `
    <div class="flex flex-col gap-4">
      @for (level of levels; track level) {
        <h1>{{ level }}</h1>
        <mat-chip-set class="flex flex-row flex-wrap gap-4 items-center">
          <app-chip [level]="level" translocoKey="Basic chip" />
          <app-chip [level]="level" iconName="mail" translocoKey="Icon chip" />
          <app-chip [level]="level" [disabled]="true" translocoKey="Disabled chip" />
          <app-chip [level]="level" [deletable]="true" translocoKey="Deletable chip" />
          <app-chip [level]="level" [disabled]="true" [deletable]="true" translocoKey="Disabled + Deletable chip" />
          <app-chip [level]="level" iconName="mail" [deletable]="true" translocoKey="Icon + Deletable chip" />
        </mat-chip-set>
      }

      <h1>draggable</h1>
      <mat-chip-set cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="drop($event)">
        @for (fish of fishes(); track fish.label) {
          <app-chip
            level="primary"
            [iconName]="fish.iconName"
            [deletable]="fish.deletable"
            [translocoKey]="fish.label"
            cdkDrag
          />
        }
      </mat-chip-set>

      <h1>selectable</h1>
      <mat-chip-listbox>
        <app-chip variant="option" [selected]="true" translocoKey="Selected" level="tertiary" />
        <app-chip
          variant="option"
          [selected]="true"
          [disabled]="true"
          translocoKey="Selected disabled"
          level="tertiary"
        />
        <app-chip
          variant="option"
          [selected]="false"
          [disabled]="true"
          translocoKey="Unselected disabled"
          level="tertiary"
        />
      </mat-chip-listbox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryChipsStorybookComponent {
  readonly levels = LEVELS;
  readonly fishes = signal<{ label: string; iconName?: "mail"; deletable: boolean }[]>([
    { label: "One fish", deletable: false },
    { label: "Two fish", deletable: false },
    { label: "Three fish", iconName: "mail", deletable: false },
    { label: "Four fish", deletable: true },
  ]);

  drop(event: CdkDragDrop<unknown>) {
    this.fishes.update((items) => {
      const next = [...items];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }
}

type Story = StoryObj<StoryChipsStorybookComponent>;

const meta: Meta<StoryChipsStorybookComponent> = {
  component: StoryChipsStorybookComponent,
  title: "Components/Components/Chips",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Chip: Story = {
  render: (args) => ({
    props: args,
    template: `<app-chips-storybook />`,
  }),
};
