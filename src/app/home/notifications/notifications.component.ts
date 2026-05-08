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

import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from "@angular/core";

import { NotificationsComponentService } from "./notifications-component.service";
import { Notification } from "@tenzu/repository/notifications";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { MatTooltip } from "@angular/material/tooltip";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { SafeHtmlPipe } from "@tenzu/pipes/safe-html.pipe";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { UserNested } from "@tenzu/repository/user";
import { MatDialogContent } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { MatBadge } from "@angular/material/badge";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { StoryNamePipe } from "@tenzu/pipes/story-name.pipe";
import { StoryUrlPipe } from "@tenzu/pipes/url/story-url.pipe";
import { WorkspaceUrlPipe } from "@tenzu/pipes/url/workspace-url.pipe";
import { ProjectLandingPageUrl } from "@tenzu/pipes/url/project-landing-page-url.pipe";
import { FileSizePipe } from "@tenzu/pipes/humanize-file-size";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

@Component({
  selector: "app-notification-unit",
  standalone: true,

  imports: [AvatarComponent, MatTooltip, TranslocoDirective, RouterLink, SafeHtmlPipe, MatBadge],
  providers: [StoryNamePipe, StoryUrlPipe, ProjectLandingPageUrl, WorkspaceUrlPipe, FileSizePipe],
  template: `
    @let notif = notification();
    <div
      tabindex="1"
      (keyup)="read.emit()"
      class="flex flex-row items-center gap-4 px-1 py-1.5 rounded cursor-pointer my-1.5 hover:bg-secondary-container"
      *transloco="let t"
      (click)="read.emit()"
      [class.opacity-60]="!!notif.readAt"
    >
      @let context = getContext(notif);
      @if (context.user) {
        <app-avatar
          [name]="context.user.fullName"
          [matTooltip]="context.user.fullName"
          [color]="context.user.color"
          [mode]="'filled-circle'"
        />
      }
      <div class="w-full mr-2">
        <p
          class="text-on-surface-variant"
          matBadge="1"
          matBadgeSize="small"
          [matBadgeHidden]="!!notif.readAt"
          [innerHTML]="t(context.translateKey, context.params) | safeHtml"
        ></p>
        @if (context.link.url) {
          <a [routerLink]="context.link.url" class="line-clamp-1">
            {{ context.link.label }}
          </a>
        } @else {
          <span class="line-clamp-1">{{ context.link.label }} </span>
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
  readonly storyNamePipe = inject(StoryNamePipe);
  readonly storyUrlPipe = inject(StoryUrlPipe);
  readonly projectLandingPageUrl = inject(ProjectLandingPageUrl);
  readonly workspaceUrlPipe = inject(WorkspaceUrlPipe);
  readonly translocoService = inject(TranslocoService);
  readonly fileSizePipe = inject(FileSizePipe);
  readonly configAppService = inject(ConfigAppService);

  getContext(notification: Notification): {
    user?: UserNested;
    params: Record<string, string>;
    translateKey: string;
    link: { url?: string; label: string };
  } {
    const translateKey = `notifications.types.${notification.type}`;
    switch (notification.type) {
      case "stories.assign": {
        return {
          link: {
            url: this.storyUrlPipe.transform(notification.content),
            label: this.storyNamePipe.transform(notification.content.story),
          },
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
          link: {
            url: this.storyUrlPipe.transform(notification.content),
            label: this.storyNamePipe.transform(notification.content.story),
          },
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
          link: {
            url: this.storyUrlPipe.transform(notification.content),
            label: this.storyNamePipe.transform(notification.content.story),
          },
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
          link: {
            url: undefined,
            label: this.storyNamePipe.transform(notification.content.story),
          },
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName },
            user: user,
          },
        };
      }
      case "stories.workflow_change": {
        const user = notification.content.changedBy;
        return {
          link: {
            url: this.storyUrlPipe.transform(notification.content),
            label: this.storyNamePipe.transform(notification.content.story),
          },
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName, status: notification.content.status },
            user: user,
          },
        };
      }
      case "story_comment.create": {
        const user = notification.content.commentedBy;
        return {
          link: {
            url: this.storyUrlPipe.transform(notification.content),
            label: this.storyNamePipe.transform(notification.content.story),
          },
          ...{
            translateKey: translateKey,
            params: { fullName: user.fullName },
            user: user,
          },
        };
      }
      case "project_importation.fail": {
        return {
          link: {
            url: this.workspaceUrlPipe.transform(notification.content),
            label: this.translocoService.translate("workspace.general_title.named_workspace", {
              name: notification.content.workspace.name,
            }),
          },
          ...{
            user: undefined,
            translateKey: translateKey,
            params: { fileName: notification.content.projectImportation.sourceName },
          },
        };
      }
      case "project_importation.warning.file_too_big": {
        return {
          link: {
            url: this.projectLandingPageUrl.transform(notification.content.project),
            label: this.translocoService.translate("workspace.general_title.named_workspace", {
              name: notification.content.project.name,
            }),
          },
          ...{
            user: undefined,
            translateKey: translateKey,
            params: {
              fileName: notification.content.projectImportation.sourceName,
              errorFileName: notification.content.fileName,
              errorFileSize: this.fileSizePipe.transform(notification.content.fileSize),
              maxFileSize: this.fileSizePipe.transform(this.configAppService.config().maxUploadFileSize || 0),
            },
          },
        };
      }
    }
  }
}

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [
    NotificationUnitComponent,
    MatDialogContent,
    MatDivider,
    TranslocoDirective,
    MatSlideToggle,
    ButtonComponent,
  ],
  template: `
    <mat-dialog-content *transloco="let t">
      <div class="flex flex-row justify-between !min-w-[450px] pb-2.5 items-center">
        <p class="mat-title-medium">
          {{ t("notifications.title") }}
        </p>

        <div class="flex flex-row gap-1 items-center">
          @if (hasUnread()) {
            <app-button
              level="secondary"
              [iconOnly]="true"
              iconName="mark_email_read"
              translocoKey="notifications.read_all"
              (click)="readAll()"
            />
          }
          <mat-slide-toggle
            class="slide-toggle-notification"
            (toggleChange)="toggleShowRead()"
            [checked]="showOnlyUnread()"
            >{{ t("notifications.only_unread") }}</mat-slide-toggle
          >
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="flex flex-col">
        @for (notification of notifications(); track notification.id) {
          <app-notification-unit [notification]="notification" (read)="read(notification)"></app-notification-unit>
          @if (!$last) {
            <mat-divider />
          }
        } @empty {
          <div class="mat-body-medium text-on-surface-variant px-1 py-1.5 my-1.5">{{ t("notifications.empty") }}</div>
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
  hasUnread = computed(() => {
    return this.notifications().some((notification) => !notification.readAt);
  });
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
  async readAll() {
    await this.notificationsComponentService.readAll();
  }
  toggleShowRead() {
    this.showOnlyUnread.update((value) => !value);
  }
}
