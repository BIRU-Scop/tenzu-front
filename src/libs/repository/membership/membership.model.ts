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
import { PermissionsBase, ProjectPermissions, WorkspacePermissions } from "../permission/permission.model";
import { userNestedSchema } from "../user/user.model";

export const permissionSchema = z.union([
  z.enum(PermissionsBase),
  z.enum(WorkspacePermissions),
  z.enum(ProjectPermissions),
  z.literal("is_member"),
]);
export type Permission = z.infer<typeof permissionSchema>;
export const MemberPermission = "is_member" as const satisfies Permission;

export const membershipBaseSchema = z.object({
  id: z.string(),
  user: userNestedSchema,
  roleId: z.string<Role["id"]>(),
});
export type MembershipBase = z.infer<typeof membershipBaseSchema>;

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  isOwner: z.boolean(),
  order: z.number(),
  editable: z.boolean(),
  permissions: z.array(permissionSchema),
});
export type Role = z.infer<typeof roleSchema>;

export const userRoleSchema = z.object({
  userRole: roleSchema.apply(optionalNullable),
});
export type UserRole = z.infer<typeof userRoleSchema>;
