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

import { PasswordFieldComponent } from "../../libs/shared/components/form/password-field/password-field.component";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";
import {
  PasswordRequirements,
  PasswordSettings,
} from "../../libs/shared/components/form/password-field/password-strength/_utils";

const DEFAULT_STRENGTH_SETTINGS = { enabled: false, lengthSecureThreshold: 15, showBar: false };
const DEFAULT_SETTINGS: PasswordSettings = {
  strength: DEFAULT_STRENGTH_SETTINGS,
};

@Component({
  selector: "app-form-password-field",
  standalone: true,
  imports: [ReactiveFormsModule, PasswordFieldComponent, JsonPipe],
  template: `
    <form [formGroup]="form" class="flex flex-col">
      <span>Initial value: {{ value() }}</span>
      <span>Current value: {{ form.value | json }}</span>
      <span>Signature: {{ passwordComponent.strength() | json }}</span>
      <span>Settings: {{ passwordComponent.settings() | json }}</span>
      <span>Requirements: {{ passwordComponent.requirements() | json }}</span>
      <div class="flex mb-52">
        <app-password-field
          #passwordComponent
          formControlName="password"
          [settings]="settings()"
          [requirements]="requirements()"
        />
      </div>
      <span>Errors: {{ passwordComponent.ngControl.control.errors | json }}</span>
      <span>Pristine: {{ passwordComponent.ngControl.control.pristine }}</span>
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryPasswordFieldComponent {
  value = input<string>("");
  form = new FormGroup({
    password: new FormControl<string | undefined>(""),
  });
  settings = input(DEFAULT_SETTINGS, {
    transform: (settings: PasswordSettings) => {
      const strengthSettings = { ...DEFAULT_STRENGTH_SETTINGS, ...(settings.strength ?? {}) };
      return { ...settings, strength: strengthSettings };
    },
  });
  requirements = input<Partial<PasswordRequirements>>({});

  constructor() {
    toObservable(this.value).subscribe((data) => {
      this.form.setValue({ password: data });
    });
  }
}

type Story = StoryObj<StoryPasswordFieldComponent>;

const meta: Meta<StoryPasswordFieldComponent> = {
  title: "Components/FormFields/Password",
  component: StoryPasswordFieldComponent,
  args: {
    value: "my password-field",
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

export const Valid: Story = {
  args: {
    value: "MyValidPassword@",
  },
};

export const Empty: Story = {
  args: {
    value: "",
  },
};

export const EnabledStrengthValid: Story = {
  args: {
    value: "1&aaaaaa",
    settings: {
      strength: { enabled: true },
    },
  },
};

export const EnabledStrengthEmpty: Story = {
  args: {
    value: "",
    settings: {
      strength: { enabled: true },
    },
  },
};

export const EnabledStrengthTooSmall: Story = {
  args: {
    value: "1a&A",
    settings: {
      strength: { enabled: true },
    },
  },
};

export const EnabledStrengthNotEnoughDiversity: Story = {
  args: {
    value: "aaaaaaaa",
    settings: {
      strength: { enabled: true },
    },
  },
};

export const EnabledStrengthBar: Story = {
  args: {
    value: "",
    settings: {
      strength: { enabled: true, showBar: true },
    },
  },
};

export const EnabledStrengthBarIgnoredCharactersOnly: Story = {
  args: {
    value: "£ùéà学中カタカナ",
    settings: {
      strength: { enabled: true, showBar: true },
    },
  },
};

export default meta;
