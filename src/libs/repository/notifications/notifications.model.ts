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

import { UserNested } from "../user";
import { StoryNested } from "../story";
import { ProjectLinkNested } from "../project";
import { WorkspaceLinkNested } from "@tenzu/repository/workspace";
import { ProjectImportationNested } from "@tenzu/repository/importation";
import { StoryCommentNested } from "@tenzu/repository/story-comment";

export type NotificationType =
  | "stories.assign"
  | "stories.unassign"
  | "story_comment.create"
  | "stories.status_change"
  | "stories.workflow_change"
  | "stories.delete"
  | "project_importation.fail"
  | "project_importation.warning.file_too_big";

export type NotificationBase = {
  id: string;
  type: NotificationType;
  createdBy: UserNested;
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
    story: StoryNested;
    project: ProjectLinkNested;
    assignedBy: UserNested;
    assignedTo: UserNested;
  };
};
export type StoryUnassignNotification = NotificationBase & {
  type: "stories.unassign";
  content: {
    story: StoryNested;
    project: ProjectLinkNested;
    unassignedBy: UserNested;
    unassignedTo: UserNested;
  };
};
export type StoryStatusChangeNotification = NotificationBase & {
  type: "stories.status_change";
  content: {
    story: StoryNested;
    project: ProjectLinkNested;
    status: string;
    changedBy: UserNested;
  };
};
export type StoryDeleteNotification = NotificationBase & {
  type: "stories.delete";
  content: {
    story: StoryNested;
    project: ProjectLinkNested;
    deletedBy: UserNested;
  };
};
export type StoryWorkflowChangeNotification = NotificationBase & {
  type: "stories.workflow_change";
  content: {
    story: StoryNested;
    project: ProjectLinkNested;
    changedBy: UserNested;
    status: string;
    workflow: string;
  };
};
export type StoryCommentCreateNotification = NotificationBase & {
  type: "story_comment.create";
  content: {
    project: ProjectLinkNested;
    story: StoryNested;
    commentedBy: UserNested;
    comment: StoryCommentNested;
  };
};
export type ProjectImportationFailNotification = NotificationBase & {
  type: "project_importation.fail";
  content: {
    workspace: WorkspaceLinkNested;
    projectImportation: ProjectImportationNested;
  };
};
export type ProjectImportationWarningFileNotification = NotificationBase & {
  type: "project_importation.warning.file_too_big";
  content: {
    project: ProjectLinkNested;
    projectImportation: ProjectImportationNested;
    fileName: string;
    fileSize: number;
  };
};

export type Notification =
  | StoryAssignNotification
  | StoryUnassignNotification
  | StoryStatusChangeNotification
  | StoryDeleteNotification
  | StoryWorkflowChangeNotification
  | StoryCommentCreateNotification
  | ProjectImportationFailNotification
  | ProjectImportationWarningFileNotification;
