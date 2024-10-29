import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
import { JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { EmailFieldComponent } from "./email-field.component";
import { toObservable } from "@angular/core/rxjs-interop";
import { provideAnimations } from "@angular/platform-browser/animations";
import { userEvent, within } from "@storybook/test";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
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
