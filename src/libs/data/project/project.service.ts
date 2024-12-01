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

import { inject, Injectable } from "@angular/core";
import { ProjectInfraService } from "./project-infra.service";
import { WsService } from "@tenzu/utils/services";
import { ProjectDetailStore, ProjectStore } from "./project.store";
import { lastValueFrom } from "rxjs";
import { Workflow, WorkflowInfraService } from "../workflow";
import { Project, ProjectBase, ProjectCreation, ProjectSummary } from "./project.model";
import { ServiceStore } from "../interface";

@Injectable({
  providedIn: "root",
})
export class ProjectService implements ServiceStore<ProjectSummary, Project> {
  projectInfraService = inject(ProjectInfraService);
  workflowInfraService = inject(WorkflowInfraService);
  projectStore = inject(ProjectStore);
  projectDetailStore = inject(ProjectDetailStore);
  wsService = inject(WsService);
  entities = this.projectStore.entities;
  selectedEntity = this.projectDetailStore.item;
  entityMap = this.projectStore.entityMap;

  async deleteSelected() {
    const project = this.projectDetailStore.item();
    if (project) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: project.id as string });
      await lastValueFrom(this.projectInfraService.delete(project.id));
      this.projectStore.removeEntity(project.id);
      this.projectDetailStore.reset();
      return project;
    }
    return undefined;
  }
  async list() {
    const projects = await lastValueFrom(this.projectInfraService.list());
    this.projectStore.setAllEntities(projects);
    return projects;
  }
  async createWorkflow(projectId: string, workflow: Pick<Workflow, "name">) {
    const newWorkflow = await lastValueFrom(this.workflowInfraService.create(projectId, workflow));
    this.projectDetailStore.addWorkflow(newWorkflow);
    return newWorkflow;
  }
  async get(projectId: string) {
    const oldSelectedEntityId = this.projectDetailStore.item()?.id as string;
    if (oldSelectedEntityId) {
      this.wsService.command({ command: "unsubscribe_from_project_events", project: oldSelectedEntityId });
    }
    const project = await lastValueFrom(this.projectInfraService.get(projectId));
    this.projectStore.setEntity(project);
    this.projectDetailStore.set(project);
    this.wsService.command({ command: "subscribe_to_project_events", project: project.id });
    return project;
  }
  async updateSelected(project: Partial<ProjectBase>) {
    const selectedEntity = this.projectDetailStore.item();
    if (selectedEntity) {
      const editedProject = await lastValueFrom(this.projectInfraService.patch(selectedEntity.id, project));
      this.projectStore.setEntity(editedProject);
      this.projectDetailStore.patch(editedProject);
      return editedProject;
    }
    return undefined;
  }
  async create(project: ProjectCreation) {
    const newProject = await lastValueFrom(this.projectInfraService.create(project));
    this.projectStore.setEntity(newProject);
    return newProject;
  }

  resetSelectedEntity(): void {
    this.projectDetailStore.reset();
  }
  resetEntities(): void {
    this.projectStore.reset();
  }
  wsRemoveEntity(workspaceId: string) {
    this.projectStore.removeEntity(workspaceId);
  }
  wsAddWorkdlow(workflow: Workflow) {
    this.projectDetailStore.addWorkflow(workflow);
  }
  fullReset(): void {
    this.resetEntities();
    this.resetSelectedEntity();
  }
}
