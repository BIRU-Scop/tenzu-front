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

import { UserMinimal } from "../user";
import { ProjectDetail } from "../project";
import { WorkspaceSummary } from "../workspace";

export type ProjectForProjectMembership = Pick<
  ProjectDetail,
  "logo" | "logoSmall" | "logoLarge" | "id" | "name" | "slug" | "description" | "color"
>;

export type WorkspaceForWorkspaceMembership = Pick<WorkspaceSummary, "id" | "name" | "slug">;

export type WorkspaceMembership = {
  user: UserMinimal;
  workspace: WorkspaceForWorkspaceMembership;
  projects: ProjectForProjectMembership[];
};
