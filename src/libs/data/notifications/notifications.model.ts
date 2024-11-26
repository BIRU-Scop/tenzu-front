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

import { UserMinimal } from "@tenzu/data/user";
import { Story } from "@tenzu/data/story";
import { Project } from "@tenzu/data/project";

export type NotificationType =
  | "stories.assign"
  | "stories.unassign"
  | "story_comment.create"
  | "stories.status_change"
  | "stories.workflow_change"
  | "stories.delete";

export type NotificationBase = {
  id: string;
  type: NotificationType;
  createdBy: UserMinimal;
  createdAt: string;
  readAt: string;
  content: string;
};

export type NotificationCount = {
  total: number;
  read: number;
  unread: number;
};

export type StoryAssignNotification = NotificationBase & {
  type: "stories.assign";
  content: {
    story: Story;
    project: Project;
    assignedBy: UserMinimal;
    assignedTo: UserMinimal;
  };
};
export type StoryUnassignNotification = NotificationBase & {
  type: "stories.unassign";
  content: {
    story: Story;
    project: Project;
    unassignedBy: UserMinimal;
    unassignedTo: UserMinimal;
  };
};
export type StoryStatusChangeNotification = NotificationBase & {
  type: "stories.status_change";
  content: {
    story: Story;
    project: Project;
    status: string;
    changedBy: UserMinimal;
  };
};
export type StoryDeleteNotification = NotificationBase & {
  type: "stories.delete";
  content: {
    story: Story;
    project: Project;
    deletedBy: UserMinimal;
  };
};
export type StoryWorkflowChangeNotification = NotificationBase & {
  type: "stories.workflow_change";
  content: {
    story: Story;
    project: Project;
    changedBy: UserMinimal;
    status: string;
    workflow: string;
  };
};

export type Notification =
  | StoryAssignNotification
  | StoryUnassignNotification
  | StoryStatusChangeNotification
  | StoryDeleteNotification
  | StoryWorkflowChangeNotification;
