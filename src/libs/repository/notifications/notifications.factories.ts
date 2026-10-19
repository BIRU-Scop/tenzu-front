/*
 * Copyright (C) 2026 BIRU
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

import { makeUserNested } from "../user/user.factories";
import { makeStoryNested } from "../story/story.factories";
import { makeProjectLinkNested } from "../project/project.factories";
import { NotificationCount, StoryAssignNotification } from "./notifications.model";

export function makeStoryAssignNotification(overrides: Partial<StoryAssignNotification> = {}): StoryAssignNotification {
  return {
    id: "notification-1",
    type: "stories.assign",
    createdBy: makeUserNested(),
    createdAt: "2026-01-01T00:00:00.000Z",
    readAt: "2026-01-02T00:00:00.000Z",
    content: {
      story: makeStoryNested(),
      project: makeProjectLinkNested(),
      assignedBy: makeUserNested(),
      assignedTo: makeUserNested(),
    },
    ...overrides,
  };
}

export function makeNotificationCount(overrides: Partial<NotificationCount> = {}): NotificationCount {
  return {
    total: 3,
    read: 1,
    unread: 2,
    ...overrides,
  };
}
