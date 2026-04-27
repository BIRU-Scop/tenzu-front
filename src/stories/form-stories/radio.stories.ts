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

import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { withTransloco } from "../storybook-providers";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { disabled, form, FormField } from "@angular/forms/signals";
import { MatFormField } from "@angular/material/input";

@Component({
  selector: "app-radio-storybook",
  standalone: true,
  imports: [MatRadioGroup, MatRadioButton, MatFormField, FormField],
  template: `
    <form class="flex flex-col gap-8">
      <h1>Enabled</h1>
      <mat-radio-group [formField]="form.input1" class="flex flex-row gap-8 items-center">
        <mat-radio-button value="actif">actif</mat-radio-button>
        <mat-radio-button value="inactif">inactif</mat-radio-button>
      </mat-radio-group>

      <h1>Disabled</h1>
      <mat-radio-group [formField]="form.input2" class="flex flex-row gap-8 items-center">
        <mat-radio-button value="actif">actif</mat-radio-button>
        <mat-radio-button value="inactif">inactif</mat-radio-button>
      </mat-radio-group>

      <h1>With label</h1>

      <mat-radio-group [formField]="form.input3" class="flex flex-row gap-4 items-center">
        <mat-radio-button value="spring">Spring</mat-radio-button>
        <mat-radio-button value="summer">Summer</mat-radio-button>
        <mat-radio-button value="autumn">Autumn</mat-radio-button>
        <mat-radio-button value="winter">Winter</mat-radio-button>
      </mat-radio-group>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryRadioStorybookComponent {
  form = form(signal({ input1: "actif", input2: "actif", input3: "" }), (path) => {
    disabled(path.input2);
  });
}

type Story = StoryObj<StoryRadioStorybookComponent>;

const meta: Meta<StoryRadioStorybookComponent> = {
  component: StoryRadioStorybookComponent,
  title: "Components/FormFields/Radio",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Radio: Story = {
  render: (args) => ({
    props: args,
    template: `<app-radio-storybook />`,
  }),
};
