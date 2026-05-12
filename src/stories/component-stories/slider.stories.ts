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

import { MatSlider, MatSliderModule } from "@angular/material/slider";

const meta: Meta<MatSlider> = {
  component: MatSlider,
  title: "Components/Slider",
  decorators: [
    moduleMetadata({
      imports: [MatSliderModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Slider: Story = {
  render: (args) => ({
    props: args,
    template: `

<h1>Basic</h1>
<mat-slider class="w-full">
  <input matSliderThumb value="25">
</mat-slider>

<h1>Ticks</h1>
<mat-slider showTickMarks step="5" class="w-full">
  <input matSliderThumb value="25">
</mat-slider>

<h1>Disabled</h1>
<mat-slider disabled class="w-full">
  <input matSliderThumb value="25">
</mat-slider>

<h1>Ticks Disabled</h1>
<mat-slider showTickMarks step="5" disabled class="w-full">
  <input matSliderThumb value="25">
</mat-slider>
  
<h1>Range</h1>
<mat-slider class="w-full">
  <input matSliderStartThumb value="10">
  <input matSliderEndThumb value="50">
</mat-slider>

<h1>Range Ticks</h1>
<mat-slider showTickMarks step="5" class="w-full">
  <input matSliderStartThumb value="10">
  <input matSliderEndThumb value="50">
</mat-slider>

<h1>Range Disabled</h1>
<mat-slider disabled class="w-full">
  <input matSliderStartThumb value="10">
  <input matSliderEndThumb value="50">
</mat-slider>

<h1>Range Ticks Disabled</h1>
<mat-slider showTickMarks step="5" disabled class="w-full">
  <input matSliderStartThumb value="10">
  <input matSliderEndThumb value="50">
</mat-slider>

<h1>Thumb label</h1>
<mat-slider discrete class="w-full">
  <input matSliderThumb value="25">
</mat-slider>
  `,
  }),
};
