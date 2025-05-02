/*
 * Copyright (C) 2024-2025 BIRU
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
import { provideAnimations } from "@angular/platform-browser/animations";
import { PrimarySideNavComponent } from "../../libs/shared/components/primary-side-nav/primary-side-nav.component";
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
