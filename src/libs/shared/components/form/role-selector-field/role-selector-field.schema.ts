/*
 * Copyright (C) 2026 BIRU
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

import { disabled, schema } from "@angular/forms/signals";
import { computed, inject } from "@angular/core";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles/workspace-role-repository.service";
import { Role } from "@tenzu/repository/membership/membership.model";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles/project-role-repository.service";
import { ItemType } from "@tenzu/repository/base/misc.model";

export const roleSelectorFieldSchema = (userRole: () => Role | undefined, itemType: () => ItemType) => {
  return schema<string | null>((field) => {
    const projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
    const workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);
    const roleRepositoryService = computed(() => {
      switch (itemType()) {
        case "project": {
          return projectRoleRepositoryService;
        }
        case "workspace": {
          return workspaceRoleRepositoryService;
        }
      }
    });
    disabled(field, {
      when: ({ value }) => {
        if (!userRole()?.isOwner) {
          return value() === roleRepositoryService().ownerRole()?.id;
        }
        return false;
      },
    });
  });
};
