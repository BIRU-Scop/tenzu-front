import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { PasswordFieldComponent } from "../password-field.component";
import { ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { PasswordStrengthComponent } from "./password-strength.component";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { PasswordSeverity } from "./_utils";

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
