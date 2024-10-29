import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { MatListOption, MatSelectionList } from "@angular/material/list";

type Story = StoryObj<MatSelectionList>;

const meta: Meta<MatSelectionList> = {
  component: MatSelectionList,
  title: "Components/List/SelectionList",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatSelectionList, MatListOption],
    }),
  ],
};

export const PrimaryNavList: Story = {
  render: (args) => ({
    props: args,
    template: `
    <mat-selection-list #shoes>
      <mat-list-option>Winter</mat-list-option>
      <mat-list-option>Summer</mat-list-option>
      <mat-list-option>Autumn</mat-list-option>
      <mat-list-option>Spring</mat-list-option>
    </mat-selection-list>
    `,
  }),
};

export default meta;
