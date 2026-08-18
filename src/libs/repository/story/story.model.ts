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
import type { User } from "../user/user.model";
import { storyTagWithCountSchema } from "../story-tag/story-tag.model";
import type { StoryTag } from "../story-tag/story-tag.model";
import { WorkflowStatusNested, workflowStatusNestedSchema } from "../status/status.model";
import { Workflow, workflowNestedSchema } from "../workflow/workflow.model";
import type { ProjectDetail } from "../project/project.model";

export const storyNestedSchema = z.object({
  ref: z.int(),
  title: z.string(),
  workflowId: z.string<Workflow["id"]>(),
  projectId: z.string<ProjectDetail["id"]>(),
});
export type StoryNested = z.infer<typeof storyNestedSchema>;

export const storySummarySchema = storyNestedSchema.extend({
  version: z.int(),
  statusId: z.string<WorkflowStatusNested["id"]>(),
  assigneeIds: z.array(z.string<User["id"]>()),
  tagIds: z.array(z.string<StoryTag["id"]>()),
});
export type StorySummary = z.infer<typeof storySummarySchema>;

const storyLinkSchema = z.object({
  ref: z.int(),
  title: z.string(),
});

export const storyDetailSchema = storySummarySchema.extend({
  workflow: workflowNestedSchema,
  prev: storyLinkSchema.apply(optionalNullable),
  next: storyLinkSchema.apply(optionalNullable),
  createdBy: userNestedSchema.apply(optionalNullable),
  createdAt: isoDatetime,
  titleUpdatedAt: isoDatetime.apply(optionalNullable),
  titleUpdatedBy: userNestedSchema.apply(optionalNullable),
  descriptionUpdatedAt: isoDatetime.apply(optionalNullable),
  descriptionUpdatedBy: userNestedSchema.apply(optionalNullable),
  totalComments: z.int(),
  status: workflowStatusNestedSchema,
});
export type StoryDetail = z.infer<typeof storyDetailSchema>;

export type StoryReorder = {
  place: "after" | "before";
  ref: StorySummary["ref"];
};
export type StoryReorderPayload = {
  reorder?: StoryReorder;
  statusId: StorySummary["statusId"];
  stories: StorySummary["ref"][];
};
export type StoryReorderPayloadEvent = StoryReorderPayload & {
  status: WorkflowStatusNested;
};

export type StoryCreatePayload = Pick<StorySummary, "title" | "statusId">;

export const storyAssignmentSchema = z.object({
  user: userNestedSchema,
  story: storyNestedSchema,
});
export type StoryAssign = z.infer<typeof storyAssignmentSchema>;

export const storyTagAssignmentSchema = z.object({
  tag: storyTagWithCountSchema,
  story: storyNestedSchema,
});
export type StoryTagAssign = z.infer<typeof storyTagAssignmentSchema>;

export const storyTagAssignmentEventContentSchema = z.object({
  storyTagAssignment: storyTagAssignmentSchema,
});
