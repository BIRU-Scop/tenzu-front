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

import { StatusSummary } from "../status";
import { User, UserNested } from "../user";
import { Workflow } from "../workflow";
import { ProjectDetail } from "@tenzu/repository/project";

export type StoryNested = {
  ref: number;
  title: string;
  workflowId: Workflow["id"];
  projectId: ProjectDetail["id"];
};

export type StorySummary = StoryNested & {
  version: number;
  statusId: StatusSummary["id"];
  assigneeIds: Array<User["id"]>;
};

export type StoryDetail = StorySummary & {
  workflow: Pick<Workflow, "id" | "name" | "slug" | "projectId">;
  prev: null | {
    ref: StorySummary["ref"];
    title: StorySummary["title"];
  };
  next: null | {
    ref: StorySummary["ref"];
    title: StorySummary["title"];
  };
  createdBy?: Pick<User, "username" | "fullName" | "color">;
  createdAt: string;
  titleUpdatedAt: string | null;
  titleUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
  descriptionUpdatedAt: string | null;
  descriptionUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
  totalComments: number;
};

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
  status: StatusSummary;
};

export type StoryCreatePayload = Pick<StorySummary, "title" | "statusId">;

export type StoryAssign = {
  user: UserNested;
  story: Pick<StorySummary, "ref" | "title">;
};
