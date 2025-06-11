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

import { StatusSummary } from "../status";
import { User, UserNested } from "../user";
import { Workflow } from "../workflow";
import { ProjectDetail } from "@tenzu/repository/project";

export type Story = {
  ref: number;
  title: string;
  version: number;
  description: string;
  workflowId: Workflow["id"];
  projectId: ProjectDetail["id"];
  statusId: StatusSummary["id"];
  assigneeIds: Array<User["id"]>;
};

export type StoryDetail = Story & {
  workflow: Pick<Workflow, "id" | "name" | "slug" | "projectId">;
  prev: null | {
    ref: Story["ref"];
    title: Story["title"];
  };
  next: null | {
    ref: Story["ref"];
    title: Story["title"];
  };
  createdBy?: Pick<User, "username" | "fullName" | "color">;
  createdAt: string;
  titleUpdatedAt: string | null;
  titleUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
  descriptionUpdatedAt: string | null;
  descriptionUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
};

export type StoryReorder = {
  place: "after" | "before";
  ref: Story["ref"];
};
export type StoryReorderPayload = {
  reorder?: StoryReorder;
  statusId: Story["statusId"];
  stories: Story["ref"][];
};
export type StoryReorderPayloadEvent = StoryReorderPayload & {
  status: StatusSummary;
};

export type StoryCreate = Pick<Story, "title" | "statusId"> & Partial<Pick<Story, "description">>;

export type StoryUpdate = Partial<StoryDetail>;

export type StoryAssign = {
  user: UserNested;
  story: Pick<Story, "ref" | "title">;
};
