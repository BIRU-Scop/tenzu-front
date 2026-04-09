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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatCheckbox } from "@angular/material/checkbox";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { disabled, form, FormField, FormRoot, validate } from "@angular/forms/signals";

@Component({
  selector: "app-checkbox-field-storybook",
  standalone: true,
  imports: [FormRoot, FormField, MatCheckbox],
  template: `
    <form [formRoot]="form">
      <mat-checkbox [formField]="form.input1">checked</mat-checkbox>
      <mat-checkbox [formField]="form.input2">unchecked</mat-checkbox>
      <mat-checkbox [formField]="form.input3">disabled checked</mat-checkbox>
      <mat-checkbox [formField]="form.input4">disabled unchecked</mat-checkbox>
      <mat-checkbox indeterminate [formField]="form.input5">indeterminate</mat-checkbox>
      <mat-checkbox
        indeterminate
        [class.checkbox-invalid]="form.input6().dirty() && !form.input6().valid()"
        [formField]="form.input6"
        >error</mat-checkbox
      >
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryCheckboxFieldStorybookComponent {
  values = signal({ input1: true, input2: false, input3: true, input4: false, input5: false, input6: false });
  form = form(this.values, (path) => {
    disabled(path.input3);
    disabled(path.input4);
    validate(path.input6, (value) => {
      return value.value() !== null ? { kind: "error", message: "Value must be true" } : null;
    });
  });
  constructor() {
    this.form.input6().markAsDirty();
  }
}

type Story = StoryObj<StoryCheckboxFieldStorybookComponent>;

const meta: Meta<StoryCheckboxFieldStorybookComponent> = {
  component: StoryCheckboxFieldStorybookComponent,
  title: "Components/FormFields/Checkbox",
  decorators: [
    moduleMetadata({
      // imports: [StoryCheckboxFieldStorybookComponent],
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
    <app-checkbox-field-storybook />`,
  }),
};

export default meta;
