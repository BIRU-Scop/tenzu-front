import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { PasswordFieldComponent } from "./password-field.component";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { PasswordRequirements, PasswordSettings } from "./password-strength/_utils";

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

export default meta;
