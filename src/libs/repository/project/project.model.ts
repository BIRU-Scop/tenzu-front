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
import { optionalNullable } from "../base/schema-utils";
import { roleSchema } from "../membership/membership.model";
import type { FileValue } from "../base/misc.model";
import { projectImportationNestedSchema } from "../importation/importation.model";
import { workflowNestedSchema } from "../workflow/workflow.model";
import {
  projectNestedSchema,
  projectLinkNestedSchema,
  type ProjectNested,
  type ProjectLinkNested,
} from "./project-nested.model";

export { projectNestedSchema, projectLinkNestedSchema };
export type { ProjectNested, ProjectLinkNested };

export const projectSummarySchema = projectNestedSchema.extend({
  userIsInvited: z.boolean(),
});

export const projectDetailSchema = projectSummarySchema.extend({
  userRole: roleSchema.apply(optionalNullable),
  workflows: z.array(workflowNestedSchema),
  importation: projectImportationNestedSchema.apply(optionalNullable),
});

export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;

export type CreateProjectPayload = Pick<ProjectNested, "name" | "workspaceId" | "color" | "description"> & {
  logo: FileValue;
};

export type UpdateProjectPayload = Pick<ProjectNested, "description" | "name" | "color"> & {
  logo?: FileValue;
};
