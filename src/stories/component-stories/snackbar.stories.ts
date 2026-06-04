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

import { CommonModule } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Component, inject, input } from "@angular/core";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-open-snackbar",
  standalone: true,
  imports: [ButtonComponent],
  template: ` <app-button [level]="'tertiary'" translocoKey="Launch" (click)="openSnackBar(message(), action())" /> `,
})
class OpenSnackBarComponent {
  message = input("");
  action = input("");
  type = input<undefined | "success" | "error" | "warning" | "info">("success");
  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { panelClass: `snackbar-${this.type()}` });
  }
}

type Story = StoryObj<OpenSnackBarComponent>;

const meta: Meta<OpenSnackBarComponent> = {
  component: OpenSnackBarComponent,
  title: "Components/Snackbar",
  argTypes: {
    type: {
      options: ["", "success", "error", "warning", "info"],
      control: { type: "select" },
    },
  },
  parameters: {
    actions: {
      handles: ["click"],
    },
  },
  decorators: [
    withTransloco,
    moduleMetadata({
      imports: [CommonModule],
    }),
    applicationConfig({
      providers: [],
    }),
  ],
};

export const Snackbar: Story = {
  args: {
    message: "Changes are saved",
    action: "Close",
    type: undefined,
  },
};

export default meta;
