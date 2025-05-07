/*
 * Copyright (C) 2025 BIRU
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

import { inject, Injectable } from "@angular/core";
import { ProjectPermissions, WorkspacePermissions } from "./permission.model";
import { WorkspaceRepositoryService } from "../workspace";
import { ProjectRepositoryService } from "../project";
import { debug } from "@tenzu/utils/functions/logging";

@Injectable({
  providedIn: "root",
})
export class PermissionService {
  workspaceService = inject(WorkspaceRepositoryService);
  projectService = inject(ProjectRepositoryService);

  hasWorkspacePermission(permission: WorkspacePermissions): boolean {
    const permissions = this.workspaceService.entityDetail()?.userRole?.permissions;
    debug("ws-permission", permission, permissions);
    if (!permissions) {
      return false;
    }
    return permissions.includes(permission);
  }
  hasProjectPermission(permission: ProjectPermissions): boolean {
    const permissions = this.projectService.entityDetail()?.userRole?.permissions;
    debug("pj-permission", permission, permissions);
    if (!permissions) {
      return false;
    }
    return permissions.includes(permission);
  }
}
