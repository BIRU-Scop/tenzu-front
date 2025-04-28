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

import {
  addEntities,
  EntityId,
  removeAllEntities,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  setEntities,
  setEntity,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { patchState, signalStoreFeature, withMethods, withState } from "@ngrx/signals";
import { NotFoundEntityError } from "./errors";
import { JsonObject } from "./misc.model";

const defaultSelectId: SelectEntityId<{ id: EntityId }> = (entity) => entity.id;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEntityIdSelector(config?: { selectId?: SelectEntityId<any> }): SelectEntityId<any> {
  return config?.selectId ?? defaultSelectId;
}

export function withEntityListFeature<T extends JsonObject, State extends object = object>(
  config?: T extends { id: EntityId }
    ? { initialState?: State } //  selectId forbidden
    : { initialState?: State; selectId: SelectEntityId<NoInfer<T>> }, // selectId required
) {
  const selectId = getEntityIdSelector(config as { selectId?: SelectEntityId<NoInfer<T>> });
  return signalStoreFeature(
    withEntities<T>(),
    withMethods((store) => ({
      /**
       * Replaces all existing entities with the provided list.
       *
       * @param {T[]} entities - The new list of entities.
       */
      setAllEntities(entities: T[]) {
        patchState(store, setAllEntities(entities, { selectId }));
      },

      /**
       * Add multiple entities to current entities
       * If existing entities are in the provided set, they will be removed first
       * before being added back (order is changed)
       *
       * @param {T[]} entities - The list of entities to update.
       */
      setEntities(entities: T[]) {
        patchState(store, setEntities(entities, { selectId }));
      },

      /**
       * Adds new entities to the store.
       *
       * @param {T[]} items - The entities to add. If the entities is already present, the entities are not updated
       */
      addEntities(items: T[]) {
        patchState(store, addEntities(items, { selectId }));
      },

      /**
       * Sets a single entity in the store: delete if exist (order is changed) then add.
       *
       * @param {T} entity - The entity to set.
       */
      setEntity(entity: T) {
        patchState(store, setEntity(entity, { selectId }));
      },

      updateEntity(id: EntityId, entity: Partial<T>) {
        if (store.entityMap()[id]) {
          patchState(store, updateEntity({ id: id, changes: entity }, { selectId }));
          return { ...store.entityMap()[id] };
        }
        throw new NotFoundEntityError(`Entity ${id} not found`);
      },

      deleteEntity(id: EntityId) {
        if (store.entityMap()[id]) {
          patchState(store, removeEntity(id));
        } else {
          throw new NotFoundEntityError(`Entity ${id} not found`);
        }
      },

      /**
       * Resets the store to its initial state.
       */
      reset() {
        patchState(store, removeAllEntities());
        if (config?.initialState) {
          patchState(store, config.initialState);
        }
      },
    })),
  );
}

export function withEntityDetailStore<T extends JsonObject>(
  config?: T extends { id: EntityId } ? undefined : { selectId: SelectEntityId<NoInfer<T>> },
) {
  const selectId = getEntityIdSelector(config as { selectId?: SelectEntityId<NoInfer<T>> });
  return signalStoreFeature(
    withState<{ item: T | undefined }>({ item: undefined }),
    withMethods((store) => ({
      set(item: T) {
        patchState(store, { item: item });
      },
      /**
       * Updates an existing entity in the store with the provided partial data.
       *
       * @param {EntityId} id - The unique identifier of the entity to update.
       * @param {Partial<T>} partialItem - The partial data to update the entity with.
       * @return {T} The updated entity.
       * @throws {Error} If the entity with the specified ID is not found.
       */
      update(id: EntityId, partialItem: Partial<T>): T {
        const item = store.item();
        if (item && selectId(item) === id) {
          patchState(store, {
            item: {
              ...item,
              ...partialItem,
            },
          });
          return store.item() as T;
        }
        throw new NotFoundEntityError(`Entity ${id} not found`);
      },
      delete(id: EntityId) {
        const item = store.item();
        if (item && selectId(item) === id) {
          patchState(store, { item: undefined });
          return item;
        }
        throw new NotFoundEntityError(`Entity ${id} not found`);
      },
      reset() {
        patchState(store, { item: undefined });
      },
    })),
  );
}
