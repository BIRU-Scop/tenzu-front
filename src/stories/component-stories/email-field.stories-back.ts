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
import { JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { EmailFieldComponent } from "@tenzu/shared/components/form/email-field";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideAnimations } from "@angular/platform-browser/animations";
import { userEvent, within } from "@storybook/test";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideHttpClient } from "@angular/common/http";

type Story = StoryObj<FormEmailComponent>;

@Component({
  selector: "app-form-email",
  standalone: true,
  imports: [ReactiveFormsModule, EmailFieldComponent, JsonPipe],
  template: `
    <form [formGroup]="form">
      <app-email-field formControlName="email" />
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormEmailComponent {
  value = input<string>("");
  form = new FormGroup({
    email: new FormControl<string | undefined>("", Validators.required),
  });

  constructor() {
    toObservable(this.value).subscribe((data) => {
      this.form.setValue({ email: data });
    });
  }
}

const meta: Meta<FormEmailComponent> = {
  component: FormEmailComponent,
  title: "Components/FormFields/EmailField",
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideAnimations(),
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

export const EmailEmptyRequired: Story = {
  // Add the play to blur the field and display error
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = await canvas.findByTestId("email-input");
    await userEvent.click(emailInput);
    await userEvent.keyboard("{Tab}");
  },
};

export const EmailSimple: Story = {
  args: {
    value: "test@email.com",
  },
};

export const EmailInvalid: Story = {
  args: {
    value: "test invalid mail",
  },
  // Add the play to blur the field and display error
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = await canvas.findByTestId("email-input");
    await userEvent.click(emailInput);
    await userEvent.keyboard("{Tab}");
  },
};
export default meta;
