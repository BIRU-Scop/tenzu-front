/*
 * Copyright (C) 2024-2025 BIRU
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

import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideHttpClient } from "@angular/common/http";
import { PasswordFieldComponent } from "../../libs/shared/components/form/password-field";
import {
  DescriptionFieldComponent,
  DescriptionOptions,
} from "../../libs/shared/components/form/description-field/description-field.component";

@Component({
  selector: "app-form-password-field",
  standalone: true,
  imports: [ReactiveFormsModule, PasswordFieldComponent, JsonPipe, DescriptionFieldComponent],
  template: `
    <form [formGroup]="form">
      {{ value() }} {{ form.value | json }}
      <br />
      <app-description-field [options]="options()" #descriptionComponent formControlName="description" />
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryDescriptionFieldComponent {
  options = input.required<Partial<DescriptionOptions>>();
  value = input<string>("");
  form = new FormGroup({
    description: new FormControl<string | undefined>(""),
  });

  constructor() {
    toObservable(this.value).subscribe((data) => {
      this.form.setValue({ description: data });
    });
  }
}

type Story = StoryObj<StoryDescriptionFieldComponent>;

const meta: Meta<StoryDescriptionFieldComponent> = {
  title: "Components/FormFields/Description",
  component: StoryDescriptionFieldComponent,
  args: {
    options: {},
  },
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideAnimations(),
        provideTransloco({
          config: {
            reRenderOnLangChange: true,
            prodMode: !isDevMode(),
            availableLangs: ["en-US"],
            defaultLang: "en-US",
            fallbackLang: "en-US",
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
