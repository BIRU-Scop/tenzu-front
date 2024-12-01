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

import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import {
  EntityId,
  EntityState,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  setEntity,
} from "@ngrx/signals/entities";

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
    withMethods((store) => ({
      resetSelectedEntity() {
        patchState(store, { selectedEntityId: null });
      },
      reset() {
        patchState(store, { selectedEntityId: null });
        patchState(store, removeAllEntities());
      },
    })),
  );
}

export function withMethodsEntities<T extends { id: EntityId }>() {
  return signalStoreFeature(
    withMethods((store) => ({
      setAllEntities(entities: T[]) {
        patchState(store, setAllEntities(entities));
      },
      setEntity(entity: T) {
        patchState(store, setEntity(entity));
      },
      removeEntity(selectedEntityId: EntityId) {
        patchState(store, removeEntity(selectedEntityId));
      },
      reset() {
        patchState(store, removeAllEntities());
      },
    })),
  );
}

export function withEntity<T>() {
  return signalStoreFeature(
    withState<{ item: T | undefined }>({ item: undefined }),
    withMethods((store) => ({
      set(item: T) {
        patchState(store, { item: item });
      },
      patch(partialTtem: Partial<T>) {
        const item = store.item();
        if (item) {
          patchState(store, {
            item: {
              ...item,
              ...partialTtem,
            },
          });
          return item;
        }
        return undefined;
      },
      reset() {
        patchState(store, { item: undefined });
      },
    })),
  );
}

export function setSelectedEntity(id: EntityId) {
  return { selectedEntityId: id };
}
