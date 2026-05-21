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

import { MatBadge, MatBadgeModule } from "@angular/material/badge";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { withTransloco } from "../storybook-providers";
import { MatIcon } from "@angular/material/icon";

const meta: Meta<MatBadge> = {
  component: MatBadge,
  title: "Components/Badge",
  decorators: [
    withTransloco,
    moduleMetadata({
      imports: [MatBadgeModule, ButtonComponent, MatIcon],
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Badge: Story = {
  render: (args) => ({
    props: args,
    template: `
<div class="flex flex-col gap-4 items-start">
  <div matBadge="4" matBadgeOverlap="false">Text with a badge</div>
  
  <div matBadge="1" matBadgeSize="small">Text with small badge</div>
  <div matBadge="1" matBadgeSize="large">Text with large badge</div>
  
  <div>
    Button with a badge on the left
      <app-button [level]="'tertiary'" translocoKey="Action" matBadge="8" matBadgePosition="before" />
  </div>
  
  <div>
    Button with a badge on the right
      <app-button [level]="'tertiary'" translocoKey="Action" matBadge="7" />
    </div>
  
  <div>
    Icon with a badge
    <mat-icon class="icon-lg" matBadge="15">home</mat-icon>
      <!-- Include text description of the icon's meaning for screen-readers -->
      <span class="cdk-visually-hidden">
        Example with a home icon with overlaid badge showing the number 15
      </span>
  </div>
</div>
  `,
  }),
};
