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
import { ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { PasswordStrengthComponent } from "../../libs/shared/components/form/password-field/password-strength/password-strength.component";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { PasswordSeverity } from "../../libs/shared/components/form/password-field/password-strength/_utils";

@Component({
  selector: "app-form-password-strength",
  standalone: true,
  imports: [ReactiveFormsModule, PasswordFieldComponent, JsonPipe, PasswordStrengthComponent, MatFormField, MatInput],
  template: `
    Severity: {{ severity() }}
    <form>
      <app-password-strength #passwordStrengthComponent [severity]="severity()" />
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryPasswordStrengthComponent {
  severity = input.required<PasswordSeverity>();
}

type Story = StoryObj<StoryPasswordStrengthComponent>;

const meta: Meta<StoryPasswordStrengthComponent> = {
  title: "Components/FormFields/Password/PasswordStrength",
  component: StoryPasswordStrengthComponent,
  args: {
    severity: "none",
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

export const Weak: Story = {
  args: {
    severity: "weak",
  },
};

export const Medium: Story = {
  args: {
    severity: "medium",
  },
};

export const Strong: Story = {
  args: {
    severity: "strong",
  },
};

export default meta;
