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

import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from "@angular/core";

import { NotificationsComponentService } from "./notifications-component.service";
import { Notification } from "@tenzu/data/notifications";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { MatTooltip } from "@angular/material/tooltip";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { SafeHtmlPipe } from "@tenzu/pipes/safe-html.pipe";
import { MatDivider } from "@angular/material/divider";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { UserMinimal } from "@tenzu/data/user";
import { MatDialogContent } from "@angular/material/dialog";

@Component({
  selector: "app-notification-unit",
  standalone: true,
  imports: [AvatarComponent, MatTooltip, TranslocoDirective, RouterLink, SafeHtmlPipe],
  template: `
    @let notif = notification();
    <div
      tabindex="1"
      (keyup)="read.emit()"
      class="flex flex-row gap-2"
      *transloco="let t"
      (click)="read.emit()"
      [class.opacity-60]="!!notif.readAt"
    >
      @let context = getContext(notif);
      <app-avatar
        [name]="context.user.fullName"
        [matTooltip]="context.user.fullName"
        [color]="context.user.color"
        [rounded]="true"
      ></app-avatar>
      <div>
        <p class="text-neutral-20" [innerHTML]="t(context.translateKey, context.params) | safeHtml"></p>
        @if (context.link) {
          <a [routerLink]="notificationsComponentService.getStoryUrl(notif)" class="line-clamp-1">
            {{ notificationsComponentService.getStoryName(notif) }}
          </a>
        } @else {
          <span class="line-clamp-1">{{ notificationsComponentService.getStoryName(notif) }}</span>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationUnitComponent {
  notificationsComponentService = inject(NotificationsComponentService);
  notification = input.required<Notification>();
  read = output();

  getContext(notification: Notification): {
    user: UserMinimal;
    params: Record<string, string>;
    translateKey: string;
    link: boolean;
  } {
    const translateKey = `notifications.types.${notification.type}`;
    const response = { link: true };
    switch (notification.type) {
      case "stories.assign": {
        return {
          ...response,
          ...(this.notificationsComponentService.isCurrentUser(notification)
            ? {
                translateKey: translateKey + ".self",
                params: { fullName: notification.content.assignedBy.fullName },
                user: notification.content.assignedBy,
              }
            : {
                translateKey: translateKey,
                params: { fullName: notification.content.assignedTo.fullName },
                user: notification.content.assignedTo,
              }),
        };
      }
      case "stories.unassign": {
        return {
          ...response,
          ...(this.notificationsComponentService.isCurrentUser(notification)
            ? {
                translateKey: translateKey + ".self",
                params: { fullName: notification.content.unassignedBy.fullName },
                user: notification.content.unassignedBy,
              }
            : {
                translateKey: translateKey,
                params: { fullName: notification.content.unassignedBy.fullName },
                user: notification.content.unassignedBy,
              }),
        };
      }
      case "stories.status_change": {
        const user = notification.content.changedBy;
        return {
          ...response,
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName, status: notification.content.status },
            user: user,
          },
        };
      }
      case "stories.delete": {
        const user = notification.content.deletedBy;
        return {
          ...response,
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName },
            user: user,
            link: false,
          },
        };
      }
      case "stories.workflow_change": {
        const user = notification.content.changedBy;
        return {
          ...response,
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName, status: notification.content.status },
            user: user,
            workflow: notification.content.workflow,
          },
        };
      }
    }
  }
}

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [NotificationUnitComponent, MatDialogContent, MatDivider, TranslocoDirective, MatSlideToggle],
  template: `
    <mat-dialog-content *transloco="let t">
      <div class="flex flex-row gap-4 items-baseline">
        <p class="mat-title-medium">
          {{ t("notifications.title") }}
        </p>
        <div class="flex flex-row gap-1 items-baseline">
          <span class="mat-label-medium whitespace-nowrap">{{ t("notifications.only_unread") }}</span>
          <mat-slide-toggle (toggleChange)="toggleShowRead()" [checked]="showOnlyUnread()"></mat-slide-toggle>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        @for (notification of notifications(); track notification.id) {
          <app-notification-unit [notification]="notification" (read)="read(notification)"></app-notification-unit>
          @if (!$last) {
            <mat-divider></mat-divider>
          }
        } @empty {
          <div class="mat-body-medium text-neutral-60">{{ t("notifications.empty") }}</div>
        }
      </div>
    </mat-dialog-content>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  notificationsComponentService = inject(NotificationsComponentService);
  showOnlyUnread = signal(true);
  notifications = computed(() => {
    const notifications = this.notificationsComponentService.notifications();
    return this.showOnlyUnread() ? notifications.filter((notification) => !notification.readAt) : notifications;
  });

  async ngOnInit() {
    await this.notificationsComponentService.list();
  }
  async read(notification: Notification) {
    if (!notification.readAt) {
      await this.notificationsComponentService.read(notification);
    }
  }
  toggleShowRead() {
    this.showOnlyUnread.update((value) => !value);
  }
}
