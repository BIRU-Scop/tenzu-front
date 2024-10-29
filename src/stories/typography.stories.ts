import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { MatButton } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";

type Story = StoryObj<MatButton>;

const meta: Meta<MatButton> = {
  component: MatButton,
  title: "Components/Typography",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatButton, MatIcon],
    }),
  ],
};

export const All: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-col gap-4">
      <h1 class="mat-headline-large">Headline large</h1>
      <h2 class="mat-headline-medium">Headline medium</h2>
      <h3 class="mat-headline-small">Headline small</h3>
      <h4 class="mat-title-large">Title large</h4>
      <h5 class="mat-title-medium">Title medium</h5>
      <h6 class="mat-title-small">Title small</h6>
      <p class="mat-body-large">Body large</p>
      <p class="mat-body-medium">Body medium</p>
      <p class="mat-body-small">Body small</p>
      <p class="mat-label-large">Body large</p>
      <p class="mat-label-medium">Body medium</p>
      <p class="mat-label-small">Body small</p>
    </div>
    `,
  }),
};

export default meta;