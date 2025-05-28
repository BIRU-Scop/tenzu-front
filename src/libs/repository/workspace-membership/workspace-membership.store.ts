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
import { withEntityListFeature } from "@tenzu/repository/base/features";
import { WorkspaceMembership } from "@tenzu/repository/workspace-membership/workspace-membership.model";
import { computed } from "@angular/core";
import { UserNested } from "@tenzu/repository/user";

const selectIdWorkspaceMembership: SelectEntityId<WorkspaceMembership> = (membership) => membership.user.username;
export const WorkspaceMembershipEntitiesStore = signalStore(
  { providedIn: "root" },
  withEntityListFeature<WorkspaceMembership>({ selectId: selectIdWorkspaceMembership }),
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
