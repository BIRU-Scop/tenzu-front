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
import { withTransloco } from "../storybook-providers";
import { ColorPickerComponent } from "@tenzu/shared/components/form/color-picker/color-picker.component";

// The two sections force `color-scheme` so both renderings of the
// `light-dark()` palette are visible side by side (design-docs/006-story-tags.md).
@Component({
  selector: "app-color-picker-storybook",
  standalone: true,
  imports: [ColorPickerComponent],
  template: `
    <div class="flex flex-col gap-8">
      @for (scheme of schemes; track scheme) {
        <section
          class="flex flex-col gap-4 rounded-lg p-6"
          [style.color-scheme]="scheme"
          style="background-color: var(--mat-sys-surface); color: var(--mat-sys-on-surface)"
        >
          <h1>color picker - {{ scheme }}</h1>
          <app-color-picker [(value)]="selectedColor" />
          <p>selected color: {{ selectedColor() }}</p>
        </section>
      }
    </div>
  `,
})
class StoryColorPickerStorybookComponent {
  readonly schemes = ["light", "dark"] as const;
  readonly selectedColor = signal(3);
}

type Story = StoryObj<StoryColorPickerStorybookComponent>;

const meta: Meta<StoryColorPickerStorybookComponent> = {
  component: StoryColorPickerStorybookComponent,
  title: "Components/ColorPicker",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-color-picker-storybook />`,
  }),
};
