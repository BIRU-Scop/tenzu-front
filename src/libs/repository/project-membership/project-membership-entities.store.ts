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

import { signalStore, withComputed } from "@ngrx/signals";
import { SelectEntityId } from "@ngrx/signals/entities";
import { withEntityListFeature } from "../base";
import { ProjectMembership } from "./project-membership.model";
import { computed } from "@angular/core";
import { UserNested } from "@tenzu/repository/user";

const selectIdProjectMembership: SelectEntityId<ProjectMembership> = (membership) => membership.user.username;

export const ProjectMembershipEntitiesStore = signalStore(
  { providedIn: "root" },
  withEntityListFeature<ProjectMembership>({ selectId: selectIdProjectMembership }),
  withComputed((store) => {
    const memberMap = computed(() => {
      return store.entities().reduce(
        (acc, membership) => {
          return { ...acc, [membership.user.id]: membership.user };
        },
        {} as Record<UserNested["id"], UserNested>,
      );
    });
    const members = computed(() => {
      return Object.values(memberMap());
    });
    return { memberMap, members };
  }),
);
