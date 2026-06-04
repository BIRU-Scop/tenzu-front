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

import { UserNested } from "@tenzu/repository/user";
import { ProjectLinkNested } from "@tenzu/repository/project";
import { WorkspaceLinkNested } from "@tenzu/repository/workspace";
import { StoryAssign, StoryDetail, StoryNested, StorySummary } from "@tenzu/repository/story";

export function makeUserNested(overrides: Partial<UserNested> = {}): UserNested {
  return {
    id: "user-1",
    username: "jdoe",
    fullName: "John Doe",
    color: 1,
    email: "john.doe@example.com",
    ...overrides,
  };
}

export function makeWorkspaceLinkNested(overrides: Partial<WorkspaceLinkNested> = {}): WorkspaceLinkNested {
  return {
    id: "workspace-1",
    name: "My Workspace",
    slug: "my-workspace",
    ...overrides,
  };
}

export function makeProjectLinkNested(overrides: Partial<ProjectLinkNested> = {}): ProjectLinkNested {
  return {
    id: "project-1",
    workspaceId: "workspace-1",
    name: "My Project",
    slug: "my-project",
    landingPage: "kanban",
    ...overrides,
  };
}

export function makeStoryNested(overrides: Partial<StoryNested> = {}): StoryNested {
  return {
    ref: 1,
    title: "My story",
    workflowId: "workflow-1",
    projectId: "project-1",
    ...overrides,
  };
}

export function makeStorySummary(overrides: Partial<StorySummary> = {}): StorySummary {
  return {
    ...makeStoryNested(),
    version: 1,
    statusId: "status-1",
    assigneeIds: [],
    ...overrides,
  };
}

export function makeStoryDetail(overrides: Partial<StoryDetail> = {}): StoryDetail {
  const summary = makeStorySummary();
  return {
    ...summary,
    workflow: {
      id: summary.workflowId,
      name: "My Workflow",
      slug: "my-workflow",
      projectId: summary.projectId,
    },
    prev: null,
    next: null,
    createdBy: { username: "jdoe", fullName: "John Doe", color: 1 },
    createdAt: "2026-01-01T00:00:00.000Z",
    titleUpdatedAt: null,
    titleUpdatedBy: null,
    descriptionUpdatedAt: null,
    descriptionUpdatedBy: null,
    totalComments: 0,
    ...overrides,
  };
}

export function makeStoryAssign(overrides: Partial<StoryAssign> = {}): StoryAssign {
  return {
    user: makeUserNested(),
    story: { ref: 1, title: "My story" },
    ...overrides,
  };
}
