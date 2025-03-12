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

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { setAllEntities, updateEntity, withEntities } from "@ngrx/signals/entities";
import { Notification, NotificationCount } from "./notifications.model";

export const NotificationsStore = signalStore(
  { providedIn: "root" },
  withEntities<Notification>(),
  withState<{ count: NotificationCount }>({ count: { total: 0, read: 0, unread: 0 } }),
  withMethods((store) => ({
    setNotifications(notifications: Notification[]) {
      patchState(store, setAllEntities(notifications));
    },
    updateNotification(notification: Notification) {
      patchState(store, updateEntity({ id: notification.id, changes: { ...notification } }));
    },
    updateCount(notificationCount: NotificationCount) {
      patchState(store, { count: { ...notificationCount } });
    },
    decreaseUnreadCount() {
      const count = store.count();
      patchState(store, { count: { ...count, unread: count.unread > 0 ? count.unread - 1 : 0 } });
    },
    increaseUnreadCount() {
      const count = store.count();
      patchState(store, { count: { ...count, unread: count.unread + 1 } });
    },
    markReadEvent(notificationId: string) {
      patchState(store, updateEntity({ id: notificationId, changes: { readAt: new Date().toISOString() } }));
    },
  })),
);
