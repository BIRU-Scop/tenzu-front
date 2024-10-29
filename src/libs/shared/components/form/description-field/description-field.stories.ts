import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { JsonPipe } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { provideHttpClient } from "@angular/common/http";
import { PasswordFieldComponent } from "@tenzu/shared/components/form/password-field";
import { DescriptionFieldComponent, DescriptionOptions } from "./description-field.component";

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
