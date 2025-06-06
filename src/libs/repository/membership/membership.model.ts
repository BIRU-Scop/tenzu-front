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

import { PermissionsBase, ProjectPermissions, WorkspacePermissions } from "../permission/permission.model";
import { UserNested } from "../user";

type MemberPermission = "is_member";
export type Permission = PermissionsBase | WorkspacePermissions | ProjectPermissions | MemberPermission;
export const MemberPermission = "is_member" as const satisfies MemberPermission;

export type MembershipBase = {
  id: string;
  user: UserNested;
  roleId: string;
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
  order: number;
  editable: boolean;
  permissions: Permission[];
};

export type UserRole = {
  userRole?: Role;
};
