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

import { ProjectSummary } from "@tenzu/data/project";
import { Workflow } from "@tenzu/data/workflow";
import { WorkspaceProject } from "@tenzu/data/workspace";
import { Story } from "@tenzu/data/story";

export type UrlableProject = ProjectSummary | WorkspaceProject;

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
