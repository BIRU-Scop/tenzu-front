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

import { MatProgressBar, MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinner, MatProgressSpinnerModule } from "@angular/material/progress-spinner";

const meta: Meta<MatProgressBar | MatProgressSpinner> = {
  component: MatProgressBar,
  title: "Components/Progress Indicator",
  decorators: [
    moduleMetadata({
      imports: [MatProgressBarModule, MatProgressSpinnerModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  render: (args) => ({
    props: args,
    template: `
<h1>determinate</h1>
<div class="flex flex-col gap-2">
  <mat-progress-bar mode="determinate" value="25"></mat-progress-bar>
  <mat-progress-bar mode="determinate" value="50"></mat-progress-bar>
  <mat-progress-bar mode="determinate" value="75"></mat-progress-bar>
</div>
<h1>indeterminate</h1>
<mat-progress-bar mode="indeterminate"></mat-progress-bar>
<h1>buffer</h1>
<mat-progress-bar mode="buffer"></mat-progress-bar>
<h1>query</h1>
<mat-progress-bar mode="query"></mat-progress-bar>
  `,
  }),
};

export const Spinner: Story = {
  render: (args) => ({
    props: args,
    template: `
<h1>determinate</h1>
<div class="flex flex-col gap-2">
  <mat-progress-spinner mode="determinate" value="25"></mat-progress-spinner>
  <mat-progress-spinner mode="determinate" value="50"></mat-progress-spinner>
  <mat-progress-spinner mode="determinate" value="75"></mat-progress-spinner>
</div>
<h1>indeterminate</h1>
<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
  `,
  }),
};
