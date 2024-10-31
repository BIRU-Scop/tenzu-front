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
