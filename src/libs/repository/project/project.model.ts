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

import { UserRole } from "../membership";
import { WorkflowNested } from "../workflow";

export type ProjectLogoBase = {
  logo?: string;
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

export type ProjectDetail = ProjectSummary &
  UserRole & {
    workflows: WorkflowNested[];
  };

export type CreateProjectPayload = Pick<ProjectNested, "name" | "workspaceId" | "color" | "description"> & {
  logo: Blob | File | "";
};

export type UpdateProjectPayload = Pick<ProjectNested, "description" | "name" | "color"> & {
  logo?: Blob | File | "";
};
