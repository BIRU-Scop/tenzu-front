import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatCheckbox } from "@angular/material/checkbox";

type Story = StoryObj<MatCheckbox>;

const meta: Meta<MatCheckbox> = {
  component: MatCheckbox,
  title: "Components/FormFields/Checkbox",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatCheckbox],
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
    <p><mat-checkbox formControlName="pepperoni">Pepperoni</mat-checkbox></p>
  <p><mat-checkbox formControlName="extracheese">Extra Cheese</mat-checkbox></p>
  <p><mat-checkbox formControlName="mushroom">Mushroom</mat-checkbox></p>`,
  }),
};

export default meta;
