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

import { Status } from "@tenzu/data/status";
import { User, UserMinimal } from "@tenzu/data/user";
import { Workflow } from "@tenzu/data/workflow";
export type StoryReorderPayload = {
  reorder?: {
    place: "after" | "before";
    ref: number;
  };
  status: string;
  stories: number[];
};

export type Story = {
  ref: number;
  title: string;
  version: number;
  description: string;
  workflowId: string;
  status: Status;
  assignees: Array<UserMinimal>;
};

export interface createdBy {
  username: string;
  fullName: string;
  color: number;
}

export interface StoryDetail extends Story {
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
}

export type StoryCreate = {
  title: string;
  status: string;
};

export type StoryAttachment = {
  id: string;
  name: string;
  contentType: string;
  createdAt: string;
  size: number;
  file: string;
};

export type StoryAssign = {
  user: UserMinimal;
  story: Pick<Story, "ref" | "title">;
};
