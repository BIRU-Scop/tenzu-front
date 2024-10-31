/*
 * Copyright (C) 2024 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

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
