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

import { Story } from "./story.model";
import { computed, inject, Signal } from "@angular/core";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";

export function getAssignees(story: Signal<Pick<Story, "assigneeIds">>) {
  const projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  return computed(() => {
    const teamMemberMap = projectMembershipRepositoryService.memberMap();
    return story()
      .assigneeIds.map((userId) => teamMemberMap[userId])
      .filter((item) => !!item);
  });
}
