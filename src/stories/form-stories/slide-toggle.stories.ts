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

import { Meta, StoryObj } from "@storybook/angular";
import { Component, signal } from "@angular/core";
import { disabled, form, FormField, FormRoot } from "@angular/forms/signals";
import { MatSlideToggle } from "@angular/material/slide-toggle";

@Component({
  selector: "app-slide-toggle-field-storybook",
  standalone: true,
  imports: [FormRoot, FormField, MatSlideToggle],
  template: `
    <form [formRoot]="form" class="flex flex-col gap-2">
      <h1>With icon</h1>
      <div class="flex flex-row gap-2">
        <mat-slide-toggle [formField]="form.input1">{{ form.input1().value() ? "on" : "off" }}</mat-slide-toggle>
        <mat-slide-toggle [formField]="form.input2">{{ form.input2().value() ? "on" : "off" }} </mat-slide-toggle>
        <mat-slide-toggle [formField]="form.input3">{{ form.input3().value() ? "on" : "off" }}</mat-slide-toggle>
        <mat-slide-toggle [formField]="form.input4">{{ form.input4().value() ? "on" : "off" }}</mat-slide-toggle>
      </div>
      <h1>No icon</h1>
      <div class="flex flex-row gap-2">
        <mat-slide-toggle [hideIcon]="true" [formField]="form.input1">{{
          form.input1().value() ? "on" : "off"
        }}</mat-slide-toggle>

        <mat-slide-toggle [hideIcon]="true" [formField]="form.input2">{{
          form.input2().value() ? "on" : "off"
        }}</mat-slide-toggle>

        <mat-slide-toggle [hideIcon]="true" [formField]="form.input3">{{
          form.input3().value() ? "on" : "off"
        }}</mat-slide-toggle>
        <mat-slide-toggle [hideIcon]="true" [formField]="form.input4">{{
          form.input4().value() ? "on" : "off"
        }}</mat-slide-toggle>
      </div>
    </form>
  `,
  styles: ``,
})
class SlideToggleFieldStorybookComponent {
  values = signal({ input1: true, input2: false, input3: true, input4: false });
  form = form(this.values, (path) => {
    disabled(path.input3);
    disabled(path.input4);
  });
}

type Story = StoryObj<SlideToggleFieldStorybookComponent>;

const meta: Meta<SlideToggleFieldStorybookComponent> = {
  component: SlideToggleFieldStorybookComponent,
  title: "FormFields/SlideToggle",
  decorators: [],
};

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
    <app-slide-toggle-field-storybook />`,
  }),
};

export default meta;
