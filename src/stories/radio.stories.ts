import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";

type Story = StoryObj<MatRadioGroup>;

const meta: Meta<MatRadioGroup> = {
  component: MatRadioGroup,
  title: "Components/FormFields/Radio",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatRadioGroup, MatRadioButton],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
    <label id="example-radio-group-label" class="mat-label-large">Pick your favorite season:</label>
    <mat-radio-group
      aria-labelledby="example-radio-group-label">
      <mat-radio-button [value]="spring">Spring</mat-radio-button>
      <mat-radio-button [value]="summer">Summer</mat-radio-button>
      <mat-radio-button [value]="autumn">Autumn</mat-radio-button>
      <mat-radio-button [value]="winter">Winter</mat-radio-button>
    </mat-radio-group>`,
  }),
};

export default meta;
