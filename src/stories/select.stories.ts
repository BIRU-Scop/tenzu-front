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
import { MatOption, MatSelect } from "@angular/material/select";
import { MatFormField } from "@angular/material/input";
import { MatLabel } from "@angular/material/form-field";

type Story = StoryObj<MatSelect>;

const meta: Meta<MatSelect> = {
  component: MatSelect,
  title: "Components/FormFields/Select",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatFormField, MatLabel, MatSelect, MatOption],
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
    <mat-form-field>
      <mat-label>Your car</mat-label>
      <mat-select>
        <mat-option value="volvo">Volvo</mat-option>
        <mat-option value="toyota">Toyota</mat-option>
        <mat-option value="mercedes">Mercedes</mat-option>
        <mat-option value="audi">Audi</mat-option>
      </mat-select>
    </mat-form-field>`,
  }),
};

export default meta;
