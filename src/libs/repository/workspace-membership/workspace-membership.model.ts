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
import { membershipBaseSchema } from "../membership/membership.model";
import type { WorkspaceSummary } from "../workspace/workspace.model";
import type { ProjectNested } from "../project/project.model";

export const workspaceMembershipNestedSchema = membershipBaseSchema.extend({
  workspaceId: z.string<WorkspaceSummary["id"]>(),
});
export type WorkspaceMembershipNested = z.infer<typeof workspaceMembershipNestedSchema>;

export const workspaceMembershipSchema = workspaceMembershipNestedSchema.extend({
  totalProjectsIsMember: z.int(),
});
export type WorkspaceMembership = z.infer<typeof workspaceMembershipSchema>;

export const workspaceMembershipDeleteInfoSchema = z.object({
  isUniqueOwner: z.boolean(),
  memberOfProjects: z.array(z.string<ProjectNested["name"]>()),
  uniqueOwnerOfProjects: z.array(z.string<ProjectNested["name"]>()),
});
export type WorkspaceMembershipDeleteInfo = z.infer<typeof workspaceMembershipDeleteInfoSchema>;
