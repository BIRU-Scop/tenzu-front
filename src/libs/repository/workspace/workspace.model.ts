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
import { projectNestedSchema } from "../project/project-nested.model";
import { projectImportationSchema } from "../importation/importation.model";
import { workspaceNestedSchema } from "./workspace-nested.model";

export { workspaceLinkNestedSchema, workspaceNestedSchema } from "./workspace-nested.model";
export type { WorkspaceLinkNested, WorkspaceNested } from "./workspace-nested.model";

export const workspaceSummarySchema = workspaceNestedSchema.extend({
  userMemberProjects: z.array(projectNestedSchema),
  userInvitedProjects: z.array(projectNestedSchema),
  userImportedProjects: z.array(projectImportationSchema),
  userIsInvited: z.boolean(),
  userIsMember: z.boolean(),
  userCanCreateProjects: z.boolean(),
});
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;

export const workspaceDetailSchema = workspaceSummarySchema.extend({
  ...userRoleSchema.shape,
  totalProjects: z.int(),
});
export type WorkspaceDetail = z.infer<typeof workspaceDetailSchema>;
