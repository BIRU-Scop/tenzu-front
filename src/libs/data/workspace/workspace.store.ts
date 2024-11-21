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

import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { inject } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { EntityId, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { Workspace, WorkspaceCreation, WorkspaceEdition } from "./workspace.model";
import { WorkspaceService } from "./workspace.service";
import {
  setLoadingBegin,
  setLoadingEnd,
  setSelectedEntity,
  withLoadingStatus,
  withSelectedEntity,
  withWsCommand,
} from "../../utils/store/store-features";

export const WorkspaceStore = signalStore(
  { providedIn: "root" },
  withEntities<Workspace>(),
  withSelectedEntity(),
  withLoadingStatus(),
  withWsCommand(),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    async list() {
      patchState(store, setLoadingBegin());
      const workspaces = await lastValueFrom(workspaceService.list());
      patchState(store, setAllEntities(workspaces ? workspaces : []));
      patchState(store, setLoadingEnd());
      return workspaces;
    },
    async create(workspace: WorkspaceCreation) {
      const newWorkspace = await lastValueFrom(workspaceService.create(workspace));
      patchState(store, setAllEntities(newWorkspace ? [newWorkspace, ...store.entities()] : []));
    },
    async get(id: string) {
      const oldSelectedEntityId = store.selectedEntityId();
      if (oldSelectedEntityId) {
        store.sendCommand({ command: "unsubscribe_to_workspace_events", workspace: oldSelectedEntityId as string });
      }
      patchState(store, setLoadingBegin());
      const workspace = await lastValueFrom(workspaceService.get(id));
      patchState(store, setLoadingEnd());
      patchState(store, setEntity(workspace));
      patchState(store, setSelectedEntity(id));
      store.sendCommand({ command: "subscribe_to_workspace_events", workspace: workspace.id });
      return workspace;
    },
    async patchSelectedEntity(workspace: WorkspaceEdition) {
      const selectedEntity = store.selectedEntity();
      if (selectedEntity) {
        const editedWorkspace = await lastValueFrom(workspaceService.patch(selectedEntity.id, workspace));
        patchState(store, setEntity(editedWorkspace));
      }
    },
    removeEntity(selectedEntityId: EntityId) {
      patchState(store, removeEntity(selectedEntityId));
    },
  })),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    async deleteSelectedEntity() {
      const selectedEntityId = store.selectedEntityId();
      const selectedEntity = store.selectedEntity();
      if (selectedEntityId && selectedEntity) {
        store.sendCommand({ command: "unsubscribe_to_workspace_events", workspace: selectedEntityId as string });
        await lastValueFrom(workspaceService.delete(selectedEntity.id));
        store.removeEntity(selectedEntityId);
        store.resetSelectedEntity();
        return selectedEntity;
      }
      throw Error(`No entity to delete`);
    },
  })),
);

export type WorkspaceStore = InstanceType<typeof WorkspaceStore>;
