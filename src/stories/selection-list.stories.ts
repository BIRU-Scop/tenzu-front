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
import { MatListOption, MatSelectionList } from "@angular/material/list";

type Story = StoryObj<MatSelectionList>;

const meta: Meta<MatSelectionList> = {
  component: MatSelectionList,
  title: "Components/List/SelectionList",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatSelectionList, MatListOption],
    }),
  ],
};

export const PrimaryNavList: Story = {
  render: (args) => ({
    props: args,
    template: `
    <mat-selection-list #shoes>
      <mat-list-option>Winter</mat-list-option>
      <mat-list-option>Summer</mat-list-option>
      <mat-list-option>Autumn</mat-list-option>
      <mat-list-option>Spring</mat-list-option>
    </mat-selection-list>
    `,
  }),
};

export default meta;
