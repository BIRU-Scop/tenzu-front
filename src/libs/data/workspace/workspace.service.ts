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

import { inject, Injectable } from "@angular/core";
import { WorkspaceInfraService } from "./workspace-infra.service";
import { WorkspaceDetailStore, WorkspacesStore } from "./workspace.store";
import { WsService } from "@tenzu/utils/services/ws";
import { lastValueFrom } from "rxjs";
import { Workspace, WorkspaceCreation, WorkspaceEdition } from "./workspace.model";
import { ServiceStoreEntity } from "@tenzu/data/interface";
import { ProjectStore } from "../project/project.store";

@Injectable({
  providedIn: "root",
})
export class WorkspaceService implements ServiceStoreEntity<Workspace> {
  private wsService = inject(WsService);
  private workspaceInfraService = inject(WorkspaceInfraService);
  private workspaceStore = inject(WorkspacesStore);
  private workspaceDetailStore = inject(WorkspaceDetailStore);
  private projectStore = inject(ProjectStore);
  selectedEntity = this.workspaceDetailStore.item;
  entities = this.workspaceStore.entities;
  entityMap = this.workspaceStore.entityMap;

  async deleteSelected() {
    const workspace = this.workspaceDetailStore.item();
    if (workspace) {
      this.wsService.command({ command: "unsubscribe_to_workspace_events", workspace: workspace.id as string });
      await lastValueFrom(this.workspaceInfraService.delete(workspace.id));
      this.workspaceStore.removeEntity(workspace.id);
      this.workspaceDetailStore.reset();
      return workspace;
    }
    return undefined;
  }

  async list() {
    const workspaces = await lastValueFrom(this.workspaceInfraService.list());
    this.workspaceStore.setAllEntities(workspaces);
    return workspaces;
  }

  async create(workspace: WorkspaceCreation) {
    const newWorkspace = await lastValueFrom(this.workspaceInfraService.create(workspace));
    this.workspaceStore.setAllEntities([newWorkspace, ...this.workspaceStore.entities()]);
    return newWorkspace;
  }

  async get(workspaceId: string) {
    const oldSelectedWorkspace = this.workspaceDetailStore.item();
    if (oldSelectedWorkspace) {
      this.wsService.command({
        command: "unsubscribe_to_workspace_events",
        workspace: oldSelectedWorkspace.id as string,
      });
    }
    const workspace = await lastValueFrom(this.workspaceInfraService.get(workspaceId));
    this.workspaceDetailStore.set(workspace);
    this.workspaceStore.setEntity(workspace);
    this.wsService.command({ command: "subscribe_to_workspace_events", workspace: workspace.id });
    return workspace;
  }

  patch(workspaceId: Workspace["id"], patchValue: Partial<Workspace>) {
    this.workspaceStore.updateEntity(workspaceId, patchValue);
    this.workspaceDetailStore.patch(patchValue);
  }

  async updateSelected(workspace: WorkspaceEdition) {
    const selectedWorkspace = this.workspaceDetailStore.item();
    if (selectedWorkspace) {
      const editedWorkspace = await lastValueFrom(this.workspaceInfraService.patch(selectedWorkspace.id, workspace));
      this.workspaceStore.setEntity(editedWorkspace);
      this.workspaceDetailStore.patch(editedWorkspace);
      return editedWorkspace;
    }
    return undefined;
  }

  resetSelectedEntity() {
    this.workspaceDetailStore.reset();
  }

  resetEntities() {
    this.workspaceStore.reset();
  }

  fullReset() {
    this.resetSelectedEntity();
    this.resetEntities();
  }

  wsRemoveEntity(workspaceId: string) {
    this.workspaceStore.removeEntity(workspaceId);
  }

  getProjectsByWorkspace(workspaceId: string) {
    this.workspaceInfraService
      .getProjects(workspaceId)
      .subscribe((projects) => this.projectStore.setAllEntities(projects));
  }
}
