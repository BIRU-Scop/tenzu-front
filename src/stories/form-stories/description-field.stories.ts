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

import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { form } from "@angular/forms/signals";
import { JsonPipe } from "@angular/common";
import { Component, effect, input, isDevMode, signal } from "@angular/core";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideHttpClient } from "@angular/common/http";
import { DescriptionFieldComponent, DescriptionOptions } from "@tenzu/shared/components/form/description-field";

@Component({
  selector: "app-form-password-field",
  standalone: true,
  imports: [JsonPipe, DescriptionFieldComponent],
  template: `
    <form>
      {{ value() }} {{ form().value() | json }}
      <br />
      <app-description-field [options]="options()" #descriptionComponent [formField]="form.description" />
    </form>
  `,
  styles: ``,
})
class StoryDescriptionFieldComponent {
  options = input.required<Partial<DescriptionOptions>>();
  _data = signal({
    description: "",
  });
  value = input<string>("");
  form = form(this._data);

  constructor() {
    effect(() => {
      const value = this.value();
      this._data.set({ description: value });
    });
  }
}

type Story = StoryObj<StoryDescriptionFieldComponent>;

const meta: Meta<StoryDescriptionFieldComponent> = {
  title: "FormFields/Description",
  component: StoryDescriptionFieldComponent,
  args: {
    options: {},
  },
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideTransloco({
          config: {
            reRenderOnLangChange: true,
            prodMode: !isDevMode(),
            availableLangs: ["en-us"],
            defaultLang: "en-us",
            fallbackLang: "en-us",
            flatten: {
              aot: !isDevMode(),
            },
          },
          loader: TranslocoHttpLoaderService,
        }),
      ],
    }),
  ],
};

export const Valid: Story = {};

export default meta;
