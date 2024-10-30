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
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Component, inject, input } from "@angular/core";

@Component({
  selector: "app-open-snackbar",
  standalone: true,
  imports: [MatButton],
  template: `
    <button mat-stroked-button class="primary-button" (click)="openSnackBar(message(), action())">Launch</button>
  `,
})
class OpenSnackBarComponent {
  message = input("");
  action = input("");
  type = input<"success" | "error">("success");
  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { panelClass: `snackbar-${this.type()}` });
  }
}

type Story = StoryObj<OpenSnackBarComponent>;

const meta: Meta<OpenSnackBarComponent> = {
  component: OpenSnackBarComponent,
  title: "Components/Snackbar",
  parameters: {
    actions: {
      handles: ["click"],
    },
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export const SuccessSnackbar: Story = {
  args: {
    message: "Changes are saved",
    action: "Close",
    type: "success",
  },
};

export const ErrrorSnackbar: Story = {
  args: {
    message: "Unexcepted error",
    action: "Close",
    type: "error",
  },
};

export default meta;
