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

import { MatDivider, MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";

const meta: Meta<MatDivider> = {
  component: MatDivider,
  title: "Components/Divider",
  decorators: [
    moduleMetadata({
      imports: [MatDividerModule, MatListModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Divider: Story = {
  render: (args) => ({
    props: args,
    template: `
<mat-list>
   <h3 matSubheader>horizontal full width & inset</h3>
   <mat-list-item>
      <h4 matListItemTitle>item</h4>
      <p matListItemLine> extra info </p>
      <mat-divider [inset]="true"></mat-divider>
   </mat-list-item>
   <mat-list-item>
      <h4 matListItemTitle>item</h4>
      <p matListItemLine> extra info </p>
   </mat-list-item>
   <mat-divider></mat-divider>
   <h3 matSubheader>horizontal full width & inset</h3>
   <mat-list-item>
      <h4 matListItemTitle>item</h4>
      <p matListItemLine> extra info </p>
      <mat-divider [inset]="true"></mat-divider>
   </mat-list-item>
   <mat-list-item>
      <h4 matListItemTitle>item</h4>
      <p matListItemLine> extra info </p>
      <mat-divider [inset]="true"></mat-divider>
   </mat-list-item>
   <mat-list-item>
      <h4 matListItemTitle>item</h4>
      <p matListItemLine> extra info </p>
   </mat-list-item>
</mat-list>
<div class="flex flex-row gap-4">
  <h3>vertical full width</h3>
  <mat-divider [vertical]="true"></mat-divider>
    
  <h3>vertical inset</h3>
  <mat-divider [vertical]="true" [inset]="true"></mat-divider>
</div>
  `,
  }),
};
