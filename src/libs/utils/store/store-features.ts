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

import { patchState, signalStoreFeature, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import {
  addEntities,
  EntityId,
  removeAllEntities,
  removeEntity,
  setAllEntities,
  setEntity,
  updateEntity,
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

export function withMethodsEntities<T extends { id: EntityId }>() {
  return signalStoreFeature(
    withMethods((store) => ({
      addEntities(items: T[]) {
        patchState(store, addEntities(items));
      },
      setAllEntities(entities: T[]) {
        patchState(store, setAllEntities(entities));
      },
      setEntity(entity: T) {
        patchState(store, setEntity(entity));
      },
      updateEntity(id: EntityId, entity: Partial<T>) {
        patchState(store, updateEntity({ id: id, changes: { ...entity } }));
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

export function withMethodEntity<T>() {
  return signalStoreFeature(
    withState<{ item: T | undefined }>({ item: undefined }),
    withMethods((store) => ({
      set(item: T) {
        patchState(store, { item: item });
      },
      update(item: Partial<T>) {
        patchState(store, { item: { ...store.item(), ...item } as T });
      },
      patch(partialItem: Partial<T>) {
        const item = store.item();
        if (item) {
          patchState(store, {
            item: {
              ...item,
              ...partialItem,
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
