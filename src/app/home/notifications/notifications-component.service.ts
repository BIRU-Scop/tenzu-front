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

import { inject, Injectable } from "@angular/core";
import {
  Notification,
  NotificationsService,
  NotificationsStore,
  StoryAssignNotification,
  StoryUnassignNotification,
} from "@tenzu/repository/notifications";
import { lastValueFrom } from "rxjs";
import { UserStore } from "@tenzu/repository/user";

@Injectable({
  providedIn: "root",
})
export class NotificationsComponentService {
  userStore = inject(UserStore);
  notificationsService = inject(NotificationsService);
  notificationsStore = inject(NotificationsStore);
  notifications = this.notificationsStore.entities;
  count = this.notificationsStore.count;

  async list() {
    const notifications = await lastValueFrom(this.notificationsService.list());
    this.notificationsStore.setNotifications(notifications);
  }
  async getCount() {
    const count = await lastValueFrom(this.notificationsService.count());
    this.notificationsStore.updateCount(count);
  }
  async read(notification: Notification) {
    const readNotification = await lastValueFrom(this.notificationsService.read(notification.id));
    this.notificationsStore.updateNotification(readNotification);
    this.notificationsStore.decreaseUnreadCount();
  }

  public isCurrentUser(notification: StoryAssignNotification | StoryUnassignNotification) {
    switch (notification.type) {
      case "stories.assign": {
        return notification.content.assignedTo.username === this.userStore.myUser()?.username;
      }
      case "stories.unassign": {
        return notification.content.unassignedTo.username === this.userStore.myUser()?.username;
      }
    }
  }
}
