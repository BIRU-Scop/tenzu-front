import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { MatButton, MatIconButton } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";

type Story = StoryObj<MatButton>;

const meta: Meta<MatButton> = {
  component: MatButton,
  title: "Components/Button",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatButton, MatIcon, MatIconButton],
    }),
  ],
};

export const PrimaryButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-wrap gap-4">
        <button mat-button class="primary-button">Primary button</button>
        <button mat-button class="primary-button"><mat-icon>add</mat-icon>Primary button</button>
        <button mat-flat-button class="primary-button">Primary flat button</button>
        <button mat-flat-button class="primary-button"><mat-icon>add</mat-icon>Primary flat button</button>
        <button mat-stroked-button class="primary-button">Primary stroked button</button>
        <button mat-stroked-button class="primary-button"><mat-icon>add</mat-icon>Primary stroked button</button>
    </div>`,
  }),
};
export const SecondaryButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-wrap gap-4">
        <button mat-button class="secondary-button">Secondary button</button>
        <button mat-button class="secondary-button"><mat-icon>add</mat-icon>Secondary button</button>
        <button mat-flat-button class="secondary-button">Secondary flat button</button>
        <button mat-flat-button class="secondary-button"><mat-icon>add</mat-icon>Secondary flat button</button>
        <button mat-stroked-button class="secondary-button">Secondary stroked button</button>
        <button mat-stroked-button class="secondary-button"><mat-icon>add</mat-icon>Secondary stroked button</button>
    </div>`,
  }),
};
export const TertiaryButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-wrap gap-4">
        <button mat-button class="tertiary-button">Tertiary button</button>
        <button mat-button class="tertiary-button"><mat-icon>add</mat-icon>Tertiary button</button>
        <button mat-flat-button class="tertiary-button">Tertiary flat button</button>
        <button mat-flat-button class="tertiary-button"><mat-icon>add</mat-icon>Tertiary flat button</button>
        <button mat-stroked-button class="tertiary-button">Tertiary stroked button</button>
        <button mat-stroked-button class="tertiary-button"><mat-icon>add</mat-icon>Tertiary stroked button</button>
    </div>`,
  }),
};
export const ErrorButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-wrap gap-4">
        <button mat-button class="error-button">Error button</button>
        <button mat-button class="error-button"><mat-icon>add</mat-icon>Error button</button>
        <button mat-flat-button class="error-button">Error flat button</button>
        <button mat-flat-button class="error-button"><mat-icon>add</mat-icon>Error flat button</button>
        <button mat-stroked-button class="error-button">Error stroked button</button>
        <button mat-stroked-button class="error-button"><mat-icon>add</mat-icon>Error stroked button</button>
    </div>`,
  }),
};

export const DisabledButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-wrap gap-4">
        <button mat-button disabled>Disabled button</button>
        <button mat-button disabled><mat-icon>add</mat-icon>Disabled button</button>
        <button mat-flat-button disabled>Disabled flat button</button>
        <button mat-flat-button disabled><mat-icon>add</mat-icon>Disabled flat button</button>
        <button mat-stroked-button disabled>Disabled stroked button</button>
        <button mat-stroked-button disabled><mat-icon>add</mat-icon>Disabled stroked button</button>
    </div>`,
  }),
};

export const IconButton: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-col gap-4">
      <button mat-icon-button class="icon-xl primary-button"><mat-icon>delete</mat-icon></button>
      <button mat-icon-button class="icon-lg tertiary-button"><mat-icon>rocket</mat-icon></button>
      <button mat-icon-button class="icon-md secondary-button"><mat-icon>favorite</mat-icon></button>
      <button mat-icon-button class="icon-md" disabled><mat-icon>favorite</mat-icon></button>
      <button mat-icon-button class="icon-sm"><mat-icon>open_in_new</mat-icon></button>
    </div>`,
  }),
};

export default meta;
