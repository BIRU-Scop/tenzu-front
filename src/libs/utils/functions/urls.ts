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
import { Story } from "@tenzu/repository/story";
import { WorkspaceLinkNested } from "@tenzu/repository/workspace";

export type UrlableProject = ProjectLinkNested;

export type UrlableWorkspace = WorkspaceLinkNested;

export const HOMEPAGE_URL = "/";

export function getProjectRootListUrl(project: UrlableProject) {
  return ["workspace", project.workspaceId, "project", project.id];
}

export function getProjectRootUrl(project: UrlableProject) {
  return `/${getProjectRootListUrl(project).join("/")}`;
}

export function getProjectLandingPageUrl(project: UrlableProject) {
  return `${getProjectRootUrl(project)}/${project.landingPage}`;
}

export function getWorkflowUrl(project: UrlableProject, slug: Workflow["slug"]) {
  return `${getProjectRootUrl(project)}/kanban/${slug}`;
}

export function getStoryDetailListUrl(project: UrlableProject, ref: Story["ref"]) {
  return [`workspace`, project.workspaceId, "project", project.id, "story", ref];
}

export function getStoryDetailUrl(project: UrlableProject, ref: Story["ref"]) {
  return `/${getStoryDetailListUrl(project, ref).join("/")}`;
}

export function getWorkspaceRootListUrl(workspace: UrlableWorkspace) {
  return ["workspace", workspace.id];
}

export function getWorkspaceRootUrl(workspace: UrlableWorkspace) {
  return `/${getWorkspaceRootListUrl(workspace).join("/")}`;
}
