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

@Component({
  selector: "app-notification-unit",
  standalone: true,
  imports: [AvatarComponent, MatTooltip, TranslocoDirective, RouterLink, SafeHtmlPipe],
  template: `
    <div class="flex flex-row mx-2 gap-2" *transloco="let t" (click)="read.emit()">
      @let notif = notification();
      @let context = getContext(notif);
      <app-avatar [name]="context.user.fullName" [matTooltip]="context.user.fullName" [color]="context.user.color" [rounded]="true"></app-avatar>
      <div>
        <div [innerHTML]="t(context.translateKey, context.params)|safeHtml"></div>
        @if (context.link) {
          <a [routerLink]="notificationsComponentService.getStoryUrl(notif)">
            {{ notificationsComponentService.getStoryName(notif) }}
          </a>
        } @else {
          {{ notificationsComponentService.getStoryName(notif) }}
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
  imports: [NotificationUnitComponent, MatDivider, TranslocoDirective, MatSlideToggle],
  template: `
    <ng-container *transloco="let t">
      <div>
        <span class="mb-2">
          {{ t("notifications.title") }}
        </span>
        <span>{{ t("notifications.only_unread") }}</span>
        <mat-slide-toggle (toggleChange)="toggleShowRead()"></mat-slide-toggle>
      </div>

      <div class="flex flex-col gap-2">
        @for (notification of notifications(); track notification.id) {
          <app-notification-unit [notification]="notification" (read)="read(notification)"></app-notification-unit>
          @if (!$last) {
            <mat-divider></mat-divider>
          }
        } @empty {
          <div>{{ t("notifications.empty") }}</div>
        }
      </div>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  notificationsComponentService = inject(NotificationsComponentService);
  showRead = signal(false);
  notifications = computed(() => {
    const notifications = this.notificationsComponentService.notifications();
    return this.showRead() ? notifications : notifications.filter((notification) => !notification.readAt);
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
    this.showRead.update((value) => !value);
  }
}
