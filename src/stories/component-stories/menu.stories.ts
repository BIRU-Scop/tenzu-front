/*
 * Copyright (C) 2024-2026 BIRU
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
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-menu-storybook",
  standalone: true,
  imports: [MatButton, MatMenu, MatMenuItem, MatMenuTrigger, MatIcon],
  template: `
    <button class="tertiary-button" mat-flat-button [matMenuTriggerFor]="menu">Open menu</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>
        <span>Item 1</span>
      </button>
      <button mat-menu-item>
        <mat-icon>logout</mat-icon>
        <span>Item 1</span>
      </button>
    </mat-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryMenuStorybookComponent {}

const meta: Meta<StoryMenuStorybookComponent> = {
  component: StoryMenuStorybookComponent,
  title: "Components/Components/Menu",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
  ],
};

export default meta;

type Story = StoryObj<StoryMenuStorybookComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<app-menu-storybook />`,
  }),
};
