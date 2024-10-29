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
