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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";

type Story = StoryObj<MatRadioGroup>;

const meta: Meta<MatRadioGroup> = {
  component: MatRadioGroup,
  title: "Components/FormFields/Radio",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatRadioGroup, MatRadioButton],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
    <label id="example-radio-group-label" class="mat-label-large">Pick your favorite season:</label>
    <mat-radio-group
      aria-labelledby="example-radio-group-label">
      <mat-radio-button [value]="spring">Spring</mat-radio-button>
      <mat-radio-button [value]="summer">Summer</mat-radio-button>
      <mat-radio-button [value]="autumn">Autumn</mat-radio-button>
      <mat-radio-button [value]="winter">Winter</mat-radio-button>
    </mat-radio-group>`,
  }),
};

export default meta;
