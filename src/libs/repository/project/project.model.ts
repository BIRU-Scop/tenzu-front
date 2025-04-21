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

import { Role } from "../membership";
import { WorkflowNested } from "../workflow";
import { WorkspaceNested } from "../workspace";

export type ProjectLogoBase = {
  logo?: string;
  logoSmall?: string;
  logoLarge?: string;
};

type _ProjectBaseNested = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  landingPage: string;
};

export type ProjectNested = ProjectLogoBase &
  _ProjectBaseNested & {
    description: string;
    color: number;
  };

export type ProjectLinkNested = _ProjectBaseNested;

export type ProjectSummary = ProjectNested & {
  userIsInvited: boolean;
};

export type ProjectDetail = ProjectSummary & {
  workspace: WorkspaceNested;
  workflows: WorkflowNested[];

  userRole?: Role;
};

export type CreateProjectPayload = Pick<ProjectNested, "name"> &
  Partial<Pick<ProjectNested, "description" | "color" | "logo">>;

export type UpdateProjectPayload = Partial<Pick<ProjectNested, "description" | "name">>;
