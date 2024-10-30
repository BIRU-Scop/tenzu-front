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
import { MatCheckbox } from "@angular/material/checkbox";

type Story = StoryObj<MatCheckbox>;

const meta: Meta<MatCheckbox> = {
  component: MatCheckbox,
  title: "Components/FormFields/Checkbox",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatCheckbox],
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
    <p><mat-checkbox formControlName="pepperoni">Pepperoni</mat-checkbox></p>
  <p><mat-checkbox formControlName="extracheese">Extra Cheese</mat-checkbox></p>
  <p><mat-checkbox formControlName="mushroom">Mushroom</mat-checkbox></p>`,
  }),
};

export default meta;
