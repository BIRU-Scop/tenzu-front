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

import { z } from "zod/v4";
import { isoDatetime, optionalNullable } from "../base/schema-utils";
import { userNestedSchema } from "../user/user.model";
import { storyNestedSchema } from "../story/story.model";
import { projectLinkNestedSchema } from "../project/project-nested.model";
import { workspaceLinkNestedSchema } from "../workspace/workspace-nested.model";
import { projectImportationSchema } from "../importation/importation.model";
import type { StoryCommentNested } from "../story-comment/story-comment.model";

export type NotificationType =
  | "stories.assign"
  | "stories.unassign"
  | "story_comment.create"
  | "stories.status_change"
  | "stories.workflow_change"
  | "stories.delete"
  | "project_importation.fail"
  | "project_importation.action_needed"
  | "project_importation.warning.file_too_big";

const notificationCommonFields = {
  id: z.string(),
  createdBy: userNestedSchema,
  createdAt: isoDatetime,
  readAt: isoDatetime.apply(optionalNullable),
};

export const notificationCountSchema = z.object({
  total: z.number(),
  read: z.number(),
  unread: z.number(),
});
export type NotificationCount = z.infer<typeof notificationCountSchema>;

export const storyAssignNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("stories.assign"),
  content: z.object({
    story: storyNestedSchema,
    project: projectLinkNestedSchema,
    assignedBy: userNestedSchema,
    assignedTo: userNestedSchema,
  }),
});
export type StoryAssignNotification = z.infer<typeof storyAssignNotificationSchema>;

export const storyUnassignNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("stories.unassign"),
  content: z.object({
    story: storyNestedSchema,
    project: projectLinkNestedSchema,
    unassignedBy: userNestedSchema,
    unassignedTo: userNestedSchema,
  }),
});
export type StoryUnassignNotification = z.infer<typeof storyUnassignNotificationSchema>;

export const storyStatusChangeNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("stories.status_change"),
  content: z.object({
    story: storyNestedSchema,
    project: projectLinkNestedSchema,
    status: z.string(),
    changedBy: userNestedSchema,
  }),
});
export type StoryStatusChangeNotification = z.infer<typeof storyStatusChangeNotificationSchema>;

export const storyDeleteNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("stories.delete"),
  content: z.object({
    story: storyNestedSchema,
    project: projectLinkNestedSchema,
    deletedBy: userNestedSchema,
  }),
});
export type StoryDeleteNotification = z.infer<typeof storyDeleteNotificationSchema>;

export const storyWorkflowChangeNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("stories.workflow_change"),
  content: z.object({
    story: storyNestedSchema,
    project: projectLinkNestedSchema,
    changedBy: userNestedSchema,
    status: z.string(),
    workflow: z.string(),
  }),
});
export type StoryWorkflowChangeNotification = z.infer<typeof storyWorkflowChangeNotificationSchema>;

export const storyCommentCreateNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("story_comment.create"),
  content: z.object({
    project: projectLinkNestedSchema,
    story: storyNestedSchema,
    commentedBy: userNestedSchema,
    comment: z.custom<StoryCommentNested>(),
  }),
});
export type StoryCommentCreateNotification = z.infer<typeof storyCommentCreateNotificationSchema>;

export const projectImportationFailNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("project_importation.fail"),
  content: z.object({
    workspace: workspaceLinkNestedSchema,
    projectImportation: projectImportationSchema,
  }),
});
export type ProjectImportationFailNotification = z.infer<typeof projectImportationFailNotificationSchema>;

export const projectImportationActionNeededNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("project_importation.action_needed"),
  content: z.object({
    workspace: workspaceLinkNestedSchema,
    projectImportation: projectImportationSchema,
  }),
});
export type ProjectImportationActionNeededNotification = z.infer<
  typeof projectImportationActionNeededNotificationSchema
>;

export const projectImportationWarningFileNotificationSchema = z.object({
  ...notificationCommonFields,
  type: z.literal("project_importation.warning.file_too_big"),
  content: z.object({
    project: projectLinkNestedSchema,
    projectImportation: projectImportationSchema,
    fileName: z.string(),
    fileSize: z.number(),
  }),
});
export type ProjectImportationWarningFileNotification = z.infer<typeof projectImportationWarningFileNotificationSchema>;

export const notificationSchema = z.discriminatedUnion("type", [
  storyAssignNotificationSchema,
  storyUnassignNotificationSchema,
  storyStatusChangeNotificationSchema,
  storyDeleteNotificationSchema,
  storyWorkflowChangeNotificationSchema,
  storyCommentCreateNotificationSchema,
  projectImportationFailNotificationSchema,
  projectImportationActionNeededNotificationSchema,
  projectImportationWarningFileNotificationSchema,
]);
export type Notification = z.infer<typeof notificationSchema>;
