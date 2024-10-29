import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { provideAnimations } from "@angular/platform-browser/animations";
import { PrimarySideNavComponent } from "./primary-side-nav.component";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIconAnchor } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { provideRouter } from "@angular/router";

const meta: Meta<PrimarySideNavComponent> = {
  title: "Components/PrimarySideNavComponent",
  component: PrimarySideNavComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideRouter([])],
    }),
    moduleMetadata({
      imports: [MatToolbar, MatIconAnchor, MatIcon],
    }),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<PrimarySideNavComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
    <mat-toolbar class="w-full flex items-center">
      <a mat-icon-button class="icon-xl primary-button">
        <mat-icon>rocket</mat-icon>
      </a>
    </mat-toolbar>
    <app-primary-side-nav>Main</app-primary-side-nav>`,
  }),
};
