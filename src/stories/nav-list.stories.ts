/*
 * Copyright (C) 2024 BIRU
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
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatNavList } from "@angular/material/list";

type Story = StoryObj<MatNavList>;

const meta: Meta<MatNavList> = {
  component: MatNavList,
  title: "Components/List/NavList",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatNavList, MatListItem, MatIcon, MatListItemIcon],
    }),
  ],
};

export const PrimaryNavList: Story = {
  render: (args) => ({
    props: args,
    template: `
    <mat-nav-list>
      <a mat-list-item href="#" [activated]="true"><mat-icon matListItemIcon>home</mat-icon>Home</a>
      <a mat-list-item href="#"><mat-icon matListItemIcon>group</mat-icon>Team</a>
      <a mat-list-item href="#"><mat-icon matListItemIcon>settings</mat-icon>Settings</a>
    </mat-nav-list>`,
  }),
};

export default meta;
