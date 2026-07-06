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

import { z } from "zod/v4";
import { Role } from "../membership";
import { FileValue } from "@tenzu/repository/base/misc.model";
import { ProjectImportationNested } from "@tenzu/repository/importation";

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

export const projectSummarySchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  slug: z.string(),
  landingPage: z.string(),
  description: z.string(),
  color: z.number(),
  logo: z.string().optional(),
  userIsInvited: z.boolean(),
});

// export type ProjectDetail = ProjectSummary &
//   UserRole & {
//   workflows: WorkflowNested[];
//   importation: ProjectImportationNested | null;
// };

export const projectDetailSchema = projectSummarySchema.extend({
  userRole: z.custom<Role>().optional(),
  workflows: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      projectId: z.string(),
    }),
  ),
  importation: z.custom<ProjectImportationNested>().optional(),
});

export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export type CreateProjectPayload = Pick<ProjectNested, "name" | "workspaceId" | "color" | "description"> & {
  logo: FileValue;
};

export type UpdateProjectPayload = Pick<ProjectNested, "description" | "name" | "color"> & {
  logo?: FileValue;
};
