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

import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { MatIcon } from "@angular/material/icon";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-tabs-storybook",
  standalone: true,
  imports: [MatTabNav, MatTabLink, MatTabNavPanel, MatIcon],
  template: `
    <div class="flex flex-col gap-8">
      <section class="flex flex-col gap-4">
        <h1>sans icon</h1>
        <div class="flex flex-col gap-1">
          <nav mat-tab-nav-bar [mat-stretch-tabs]="false" [tabPanel]="panelText">
            @for (item of items; track item) {
              <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
              <a mat-tab-link [active]="activeText() === $index" (click)="activeText.set($index)">{{ item }}</a>
            }
          </nav>
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>avec icon</h1>
        <div class="flex flex-col gap-1">
          <nav mat-tab-nav-bar [mat-stretch-tabs]="false" [tabPanel]="panelIcon">
            @for (item of items; track item) {
              <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
              <a mat-tab-link [active]="activeIcon() === $index" (click)="activeIcon.set($index)">
                <mat-icon class="icon-sm mr-1">person_add</mat-icon>
                {{ item }}
              </a>
            }
          </nav>
        </div>
      </section>
    </div>
    <mat-tab-nav-panel #panelText class="hidden"></mat-tab-nav-panel>
    <mat-tab-nav-panel #panelIcon class="hidden"></mat-tab-nav-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryTabsStorybookComponent {
  readonly items = ["Item 1", "Item 2", "Item 3"];
  readonly activeText = signal(0);
  readonly activeIcon = signal(0);
}

type Story = StoryObj<StoryTabsStorybookComponent>;

const meta: Meta<StoryTabsStorybookComponent> = {
  component: StoryTabsStorybookComponent,
  title: "Components/Tabs",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-tabs-storybook />`,
  }),
};
