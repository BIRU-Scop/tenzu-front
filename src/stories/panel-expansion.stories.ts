import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";

import { CommonModule } from "@angular/common";
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from "@angular/material/expansion";
import { provideAnimations } from "@angular/platform-browser/animations";

type Story = StoryObj<MatExpansionPanel>;

const meta: Meta<MatExpansionPanel> = {
  component: MatExpansionPanel,
  title: "Components/ExpansionPanel",
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatExpansionPanelDescription,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export const Accordion: Story = {
  render: (args) => ({
    props: args,
    template: `
    <div class="flex flex-col gap-4">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title> This is the expansion title </mat-panel-title>
          <mat-panel-description> This is a summary of the content </mat-panel-description>
        </mat-expansion-panel-header>
        <p>This is the primary content of the panel.</p>
      </mat-expansion-panel>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title> This is the expansion title </mat-panel-title>
          <mat-panel-description>
            This is a summary of the content
          </mat-panel-description>
        </mat-expansion-panel-header>
            <p>This is the primary content of the panel.</p>
      </mat-expansion-panel>
    </div>`,
  }),
};

export default meta;
