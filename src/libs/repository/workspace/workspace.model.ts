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
import { userRoleSchema } from "../membership/membership.model";
import type { ProjectNested } from "../project/project.model";
import type { ProjectImportation } from "../importation/importation.model";

export const workspaceLinkNestedSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type WorkspaceLinkNested = z.infer<typeof workspaceLinkNestedSchema>;

export const workspaceNestedSchema = workspaceLinkNestedSchema.extend({
  color: z.number(),
});
export type WorkspaceNested = z.infer<typeof workspaceNestedSchema>;

export const workspaceSummarySchema = workspaceNestedSchema.extend({
  userMemberProjects: z.array(z.custom<ProjectNested>()),
  userInvitedProjects: z.array(z.custom<ProjectNested>()),
  userImportedProjects: z.array(z.custom<ProjectImportation>()),
  userIsInvited: z.boolean(),
  userIsMember: z.boolean(),
  userCanCreateProjects: z.boolean(),
});
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;

export const workspaceDetailSchema = workspaceSummarySchema.extend({
  ...userRoleSchema.shape,
  totalProjects: z.number(),
});
export type WorkspaceDetail = z.infer<typeof workspaceDetailSchema>;
