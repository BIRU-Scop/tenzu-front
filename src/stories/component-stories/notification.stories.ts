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

import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { Component, inject, input } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { NotificationService } from "@tenzu/utils/services/notification";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-open-notification",
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-rox gap-4">
      <app-button [level]="'secondary'" translocoKey="Info" (click)="openNotif(title(), detail(), 'info')" />
      <app-button [level]="'warning'" translocoKey="Warning" (click)="openNotif(title(), detail(), 'warning')" />
      <app-button [level]="'error'" translocoKey="Error" (click)="openNotif(title(), detail(), 'error')" />
      <app-button [level]="'success'" translocoKey="Success" (click)="openNotif(title(), detail(), 'success')" />
      <app-button [level]="'primary'" translocoKey="Custom Type" (click)="openNotif(title(), detail(), type())" />
    </div>
  `,
})
class OpenNotificationComponent {
  title = input("");
  detail = input("");
  type = input<"success" | "error" | "warning" | "info">("success");
  private notificationService = inject(NotificationService);

  openNotif(title: string, detail: string, type: "success" | "error" | "warning" | "info") {
    this.notificationService[type]({ title: title, detail: detail }, { duration: 200000 });
  }
}

type Story = StoryObj<OpenNotificationComponent>;

const meta: Meta<OpenNotificationComponent> = {
  component: OpenNotificationComponent,
  title: "Components/Components/Notification",
  argTypes: {
    type: {
      options: ["success", "error", "warning", "info"],
      control: { type: "select" },
    },
  },
  parameters: {
    details: {
      handles: ["click"],
    },
  },
  decorators: [
    withTransloco,
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
  ],
};

export default meta;

export const Notification: Story = {
  args: {
    title: "Message",
    detail: "",
    type: "info",
  },
};
