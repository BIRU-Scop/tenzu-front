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
import { addEntity, removeEntity, setAllEntities, setEntity, withEntities } from "@ngrx/signals/entities";
import { Project, ProjectBase } from "./project.model";
import { inject } from "@angular/core";
import { WorkspaceService } from "@tenzu/data/workspace";
import { lastValueFrom } from "rxjs";
import {
  setLoadingBegin,
  setLoadingEnd,
  setSelectedEntity,
  withLoadingStatus,
  withSelectedEntity,
} from "../../utils/store/store-features";
import { ProjectService } from "@tenzu/data/project/project.service";
import { Workflow, WorkflowService } from "@tenzu/data/workflow";

export const ProjectStore = signalStore(
  { providedIn: "root" },
  withEntities<Project>(),
  withLoadingStatus(),
  withSelectedEntity(),
  withMethods(
    (
      store,
      workspaceService = inject(WorkspaceService),
      projectService = inject(ProjectService),
      workflowService = inject(WorkflowService),
    ) => ({
      addProject(project: Project) {
        patchState(store, addEntity(project));
      },
      async createWorkflow(projectId: string, workflow: Pick<Workflow, "name">) {
        await lastValueFrom(workflowService.create(projectId, workflow));
      },
      async getProjectsByWorkspaceId(workspaceId: string) {
        patchState(store, setLoadingBegin());
        const projects = await lastValueFrom(workspaceService.getProjects(workspaceId));
        patchState(store, setLoadingEnd());
        patchState(store, setAllEntities(projects));
        return projects;
      },
      async getProject(projectId: string) {
        patchState(store, setLoadingBegin());
        const project = await lastValueFrom(projectService.get(projectId));
        patchState(store, setLoadingEnd());
        patchState(store, setEntity(project));
        patchState(store, setSelectedEntity(projectId));
        return project;
      },
      async patchSelectedEntity(project: Partial<ProjectBase>) {
        const selectedEntity = store.selectedEntity();
        if (selectedEntity) {
          const editedProject = await lastValueFrom(projectService.patch(selectedEntity.id, project));
          patchState(store, setEntity(editedProject));
        }
      },
      async deleteSelectedEntity() {
        const selectedEntityId = store.selectedEntityId();
        const selectedEntity = store.selectedEntity();
        if (selectedEntityId && selectedEntity) {
          await lastValueFrom(projectService.delete(selectedEntity.id));
          patchState(store, removeEntity(selectedEntityId));
          return selectedEntity;
        }
        throw Error(`No entity to delete`);
      },
    }),
  ),
);
