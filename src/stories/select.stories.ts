import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatFormField } from "@angular/material/input";
import { MatLabel } from "@angular/material/form-field";

type Story = StoryObj<MatSelect>;

const meta: Meta<MatSelect> = {
  component: MatSelect,
  title: "Components/FormFields/Select",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatFormField, MatLabel, MatSelect, MatOption],
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
    <mat-form-field>
      <mat-label>Your car</mat-label>
      <mat-select>
        <mat-option value="volvo">Volvo</mat-option>
        <mat-option value="toyota">Toyota</mat-option>
        <mat-option value="mercedes">Mercedes</mat-option>
        <mat-option value="audi">Audi</mat-option>
      </mat-select>
    </mat-form-field>`,
  }),
};

export default meta;
