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

import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { disabled, form, FormField, FormRoot, validate } from "@angular/forms/signals";
import { MatIcon } from "@angular/material/icon";
import { MatOption, MatSelect } from "@angular/material/select";

@Component({
  selector: "app-form-field-storybook",
  standalone: true,
  imports: [
    FormRoot,
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIcon,
    MatPrefix,
    MatSuffix,
    MatHint,
    MatSelect,
    MatOption,
  ],
  template: `
    <form [formRoot]="form" class="flex flex-row gap-4">
      <div class="flex flex-col gap-4">
        <h1>Default</h1>
        <mat-form-field>
          <mat-label>Default</mat-label>
          <input matInput [formField]="form.default" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Error</mat-label>
          <input matInput [formField]="form.error" />
          @if (form.error().invalid()) {
            <mat-error>Error message</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Disabled</mat-label>
          <input matInput [formField]="form.disabled" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Your car</mat-label>
          <mat-select [formField]="form.select">
            <mat-option value="volvo"><mat-icon>home</mat-icon>Volvo</mat-option>
            <mat-option value="toyota">Toyota</mat-option>
            <mat-option value="mercedes">Mercedes</mat-option>
            <mat-option value="audi">Audi</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Your car</mat-label>
          <mat-select [formField]="form.select" multiple>
            <mat-option value="volvo"><mat-icon>home</mat-icon>Volvo</mat-option>
            <mat-option value="toyota">Toyota</mat-option>
            <mat-option value="mercedes">Mercedes</mat-option>
            <mat-option value="audi">Audi</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Your car</mat-label>
          <mat-select [formField]="form.selected">
            <mat-option value="volvo"><mat-icon>home</mat-icon>Volvo</mat-option>
            <mat-option value="toyota"><mat-icon>home</mat-icon>Toyota </mat-option>
            <mat-option value="mercedes">Mercedes</mat-option>
            <mat-option value="audi">Audi</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Your car</mat-label>
          <mat-select [formField]="form.selectError">
            <mat-option value="volvo">Volvo</mat-option>
            <mat-option value="toyota">Toyota</mat-option>
            <mat-option value="mercedes">Mercedes</mat-option>
            <mat-option value="audi">Audi</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Your car</mat-label>
          <mat-select [formField]="form.selectDisabled">
            <mat-option value="volvo">Volvo</mat-option>
            <mat-option value="toyota">Toyota</mat-option>
            <mat-option value="mercedes">Mercedes</mat-option>
            <mat-option value="audi">Audi</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="flex flex-col gap-4">
        <h1>With icon + help text</h1>
        <mat-form-field>
          <mat-label>Default</mat-label>
          <input matInput [formField]="form.default" />
          <mat-hint>help text</mat-hint>
          <mat-icon matIconPrefix>home</mat-icon>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Error</mat-label>
          <input matInput [formField]="form.error" />
          <mat-hint>help text</mat-hint>
          <mat-icon matIconPrefix>home</mat-icon>
          @if (form.error().invalid()) {
            <mat-error>Error message</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Disabled</mat-label>
          <input matInput [formField]="form.disabled" />
          <mat-hint>help text</mat-hint>
          <mat-icon matIconPrefix>home</mat-icon>
        </mat-form-field>
      </div>
      <div class="flex flex-col gap-4">
        <h1>help text</h1>
        <mat-form-field>
          <mat-label>Default</mat-label>
          <input matInput [formField]="form.default" />
          <mat-hint>help text</mat-hint>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Error</mat-label>
          <input matInput [formField]="form.error" />
          <mat-hint>help text</mat-hint>
          @if (form.error().invalid()) {
            <mat-icon matIconSuffix>home</mat-icon>
          }
          @if (form.error().invalid()) {
            <mat-error>Error message</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label>Disabled</mat-label>
          <input matInput [formField]="form.disabled" />
          <mat-hint>help text</mat-hint>
        </mat-form-field>
      </div>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryFormFieldStorybookComponent {
  values = signal({
    default: "",
    error: "",
    disabled: "",
    select: "",
    selected: "volvo",
    selectError: "",
    selectDisabled: "",
  });
  form = form(this.values, (path) => {
    disabled(path.disabled);
    disabled(path.selectDisabled);
    validate(path.error, (value) => {
      return value.value() == "" ? { kind: "error", message: "no empty" } : null;
    });
    validate(path.selectError, (value) => {
      return value.value() == "" ? { kind: "error", message: "no empty" } : null;
    });
  });
  constructor() {
    this.form.error().markAsTouched();
    this.form.selectError().markAsTouched();
  }
}

type Story = StoryObj<StoryFormFieldStorybookComponent>;

const meta: Meta<StoryFormFieldStorybookComponent> = {
  component: StoryFormFieldStorybookComponent,
  title: "Components/FormFields/FormField",
  decorators: [
    moduleMetadata({
      // imports: [StoryFormFieldStorybookComponent],
    }),
    // applicationConfig({
    //   providers: [],
    // }),
  ],
};

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
    <app-form-field-storybook />
`,
  }),
};

export default meta;
