/*
 * Copyright (C) 2024 BIRU
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

import { signalStoreFeature, type, withComputed, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { EntityId, EntityState } from "@ngrx/signals/entities";

export function withLoadingStatus() {
  return signalStoreFeature(
    withState({ loading: false }),
    withComputed(({ loading }) => ({
      isLoading: computed(() => loading()),
    })),
  );
}

export function setLoadingBegin() {
  return { loading: true };
}

export function setLoadingEnd() {
  return { loading: false };
}

export type SelectedEntityState = { selectedEntityId: EntityId | null };

export function withSelectedEntity<Entity>() {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    })),
  );
}

export function setSelectedEntity(id: EntityId) {
  return { selectedEntityId: id };
}
