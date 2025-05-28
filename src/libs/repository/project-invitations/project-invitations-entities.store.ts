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

import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { withEntityListFeature } from "../base";
import { ProjectInvitation } from "./project-invitation.model";
import { setAllEntities } from "@ngrx/signals/entities";
import { sortInvitation } from "../membership";

export const ProjectInvitationsEntitiesSummaryStore = signalStore(
  { providedIn: "root" },
  withEntityListFeature<ProjectInvitation>(),
  withMethods((store) => ({
    reorder() {
      const entities = store.entities().sort(sortInvitation);
      patchState(store, setAllEntities(entities));
    },
  })),
);
