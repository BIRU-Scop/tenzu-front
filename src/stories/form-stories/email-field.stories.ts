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
import { Component, effect, input, isDevMode, signal } from "@angular/core";
import { form, required } from "@angular/forms/signals";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideHttpClient } from "@angular/common/http";

type Story = StoryObj<FormEmailComponent>;

@Component({
  selector: "app-form-email",
  standalone: true,
  imports: [EmailFieldComponent],
  template: `
    <form>
      <app-email-field [formField]="form.email" />
    </form>
  `,
  styles: ``,
})
class FormEmailComponent {
  value = input<string>("");
  _data = signal({ email: "" });
  form = form(this._data, (path) => {
    required(path.email);
  });

  constructor() {
    effect(() => {
      const value = this.value();
      this._data.set({ email: value });
    });
  }
}

const meta: Meta<FormEmailComponent> = {
  component: FormEmailComponent,
  title: "FormFields/EmailField",
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

export const EmailEmptyPristine: Story = {};

export const EmailSimple: Story = {
  args: {
    value: "test@email.com",
  },
};

export default meta;
