import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatNavList } from "@angular/material/list";

type Story = StoryObj<MatNavList>;

const meta: Meta<MatNavList> = {
  component: MatNavList,
  title: "Components/List/NavList",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatNavList, MatListItem, MatIcon, MatListItemIcon],
    }),
  ],
};

export const PrimaryNavList: Story = {
  render: (args) => ({
    props: args,
    template: `
    <mat-nav-list>
      <a mat-list-item href="#" [activated]="true"><mat-icon matListItemIcon>home</mat-icon>Home</a>
      <a mat-list-item href="#"><mat-icon matListItemIcon>group</mat-icon>Team</a>
      <a mat-list-item href="#"><mat-icon matListItemIcon>settings</mat-icon>Settings</a>
    </mat-nav-list>`,
  }),
};

export default meta;
