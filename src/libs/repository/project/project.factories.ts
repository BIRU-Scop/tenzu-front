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

import { ProjectDetail, ProjectLinkNested, ProjectNested, ProjectSummary } from "../project/project.model";

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

export function makeProjectNested(overrides: Partial<ProjectNested> = {}): ProjectNested {
  return {
    ...makeProjectLinkNested(),
    description: "My project description",
    color: 1,
    ...overrides,
  };
}

export function makeProjectSummary(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    ...makeProjectNested(),
    userIsInvited: false,
    ...overrides,
  };
}

export function makeProjectDetail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    ...makeProjectSummary(),
    workflows: [],
    ...overrides,
  };
}
