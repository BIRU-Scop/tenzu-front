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
import { withTransloco } from "../storybook-providers";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

type Story = StoryObj<AvatarComponent>;

const meta: Meta<AvatarComponent> = {
  component: AvatarComponent,
  title: "Components/Avatar",
  decorators: [
    withTransloco,
    moduleMetadata({
      imports: [CommonModule, AvatarComponent],
    }),
  ],
};

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `
  <div class="flex flex-col gap-8">
    <h1>Outlined — sizes</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <app-avatar name="Gigi Gray" mode="outlined" size="sm" [color]="1" />
      <app-avatar name="Gigi Gray" mode="outlined" size="md" [color]="2" />
      <app-avatar name="Gigi Gray" mode="outlined" size="lg" [color]="3" />
      <app-avatar name="Gigi Gray" mode="outlined" size="xl" [color]="4" />
    </div>

    <h1>Outlined — wrapped in button</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <button><app-avatar name="Gigi Gray" mode="outlined" size="sm" [color]="1" /></button>
      <button><app-avatar name="Gigi Gray" mode="outlined" size="md" [color]="2" /></button>
      <button><app-avatar name="Gigi Gray" mode="outlined" size="lg" [color]="3" /></button>
      <button><app-avatar name="Gigi Gray" mode="outlined" size="xl" [color]="4" /></button>
    </div>

    <h1>Filled circle — sizes</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <app-avatar name="Gigi Gray" mode="filled-circle" size="sm" [color]="4" />
      <app-avatar name="Gigi Gray" mode="filled-circle" size="md" [color]="5" />
      <app-avatar name="Gigi Gray" mode="filled-circle" size="lg" [color]="6" />
      <app-avatar name="Gigi Gray" mode="filled-circle" size="xl" [color]="8" />
    </div>

    <h1>Filled square — sizes</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <app-avatar name="Gigi Gray" mode="filled-square" size="sm" [color]="4" />
      <app-avatar name="Gigi Gray" mode="filled-square" size="md" [color]="5" />
      <app-avatar name="Gigi Gray" mode="filled-square" size="lg" [color]="6" />
      <app-avatar name="Gigi Gray" mode="filled-square" size="xl" [color]="8" />
    </div>


    <h1>Grouped</h1>
    <div class="flex flex-row -space-x-2 items-center">
      <app-avatar name="Gigi Gray" mode="filled-circle" size="md" [color]="4" />
      <app-avatar name="Ayla Yilmaz" mode="filled-circle" size="md" backgroundColor="#7c3aed" textColor="#ffffff" />
    </div>

    <h1>With image</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <app-avatar name="Gigi Gray" mode="filled-circle" size="md" imageData="https://i.pravatar.cc/64?img=12" />
      <app-avatar name="Gigi Gray" mode="filled-square" size="md" imageData="https://i.pravatar.cc/64?img=15" />
    </div>

    <h1>Overflow indicator (avatar-list pattern)</h1>
    <div class="flex flex-row flex-wrap gap-8 items-center">
      <app-avatar name="+ 3" mode="filled-circle" size="md" [color]="7" />
      <app-avatar name="&hellip;" mode="outlined" size="md" [color]="8"/>
    </div>
  </div>
`,
  }),
};

export default meta;
