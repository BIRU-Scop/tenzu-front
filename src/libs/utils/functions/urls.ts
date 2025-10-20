/*
 * Copyright (C) 2025 BIRU
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

import { ProjectLinkNested } from "@tenzu/repository/project";
import { Workflow } from "@tenzu/repository/workflow";
import { StorySummary } from "@tenzu/repository/story";
import { WorkspaceLinkNested } from "@tenzu/repository/workspace";
import { Role } from "@tenzu/repository/membership";

export const HOMEPAGE_URL = "/";

type ProjectLink = Pick<ProjectLinkNested, "workspaceId" | "id">;
type WorkspaceLink = Pick<WorkspaceLinkNested, "id">;

export function getProjectRootUrl(project: ProjectLink) {
  const urlParts = ["workspace", project.workspaceId, "project", project.id];
  return `/${urlParts.join("/")}`;
}

export function getProjectLandingPageUrl(project: Pick<ProjectLinkNested, "workspaceId" | "id" | "landingPage">) {
  return `${getProjectRootUrl(project)}/${project.landingPage}`;
}

export function getProjectMembersRootUrl(project: ProjectLink) {
  return `${getProjectRootUrl(project)}/members`;
}

export function getProjectRoleDetailEndingUrl(role: Role) {
  return `/settings/edit-role/${role.id}`;
}

export function getWorkflowRootUrl(project: ProjectLink) {
  return `${getProjectRootUrl(project)}/kanban`;
}

export function getWorkflowUrl(project: ProjectLink, slug: Workflow["slug"]) {
  return `${getWorkflowRootUrl(project)}/${slug}`;
}

export function getStoryDetailUrl(project: ProjectLink, ref: StorySummary["ref"]) {
  const urlParts = [`workspace`, project.workspaceId, "project", project.id, "story", ref];
  return `/${urlParts.join("/")}`;
}

export function getWorkspaceRootUrl(workspace: WorkspaceLink) {
  const urlParts = ["workspace", workspace.id];
  return `/${urlParts.join("/")}`;
}

export function getWorkspaceMembersRootUrl(workspace: WorkspaceLink) {
  return `${getWorkspaceRootUrl(workspace)}/members`;
}
