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
