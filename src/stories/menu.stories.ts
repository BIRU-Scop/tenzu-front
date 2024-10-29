import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { MatButton } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatIcon } from "@angular/material/icon";

type Story = StoryObj<MatButton>;

const meta: Meta<MatMenu> = {
  component: MatMenu,
  title: "Components/Menu",
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger],
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
    <button mat-flat-button class="primary-button" [matMenuTriggerFor]="menu">Menu</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item 1</button>
      <button mat-menu-item>Item 2</button>
      <button mat-menu-item><mat-icon>logout</mat-icon>Log out</button>
    </mat-menu>`,
  }),
};

export default meta;
