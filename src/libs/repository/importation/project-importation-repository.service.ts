/*
 * Copyright (C) 2024-2026 BIRU
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
import { lastValueFrom } from "rxjs";
import { ProjectImportationApiService } from "./project-importation-api.service";
import { CreateProjectImportationPayload, ProjectImportation } from "./importation.model";
import { WorkspaceRepositoryService, WorkspaceSummary } from "@tenzu/repository/workspace";
import { ProjectImportationEntitiesStore } from "@tenzu/repository/importation/project-importation.store";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";

@Injectable({
  providedIn: "root",
})
export class ProjectImportationRepositoryService {
  private importationsApiService = inject(ProjectImportationApiService);
  private workspaceService = inject(WorkspaceRepositoryService);
  private projectImportationEntitiesStore = inject(ProjectImportationEntitiesStore);
  entities = this.projectImportationEntitiesStore.entities;
  entityMap = this.projectImportationEntitiesStore.entityMap;

  addEntitySummary(params: { projectImportation: ProjectImportation; workspaceId: WorkspaceSummary["id"] }): void {
    this.workspaceService.addUserImportedProjects(params);
    this.projectImportationEntitiesStore.addEntity(params.projectImportation);
  }

  async createRequest(item: CreateProjectImportationPayload, params: { workspaceId: WorkspaceSummary["id"] }) {
    const importation = await lastValueFrom(this.importationsApiService.create(item, params));

    this.addEntitySummary({ ...params, projectImportation: importation });
    return importation;
  }

  async listRequest(params: { workspaceId: WorkspaceSummary["id"] }) {
    const projectImportations = await lastValueFrom(this.importationsApiService.list(params));
    this.projectImportationEntitiesStore.setAllEntities(projectImportations);
    return projectImportations;
  }

  resetEntitySummaryList(): void {
    this.projectImportationEntitiesStore.reset();
  }

  deleteEntitySummary(params: {
    projectImportationId: ProjectImportation["id"];
    workspaceId: WorkspaceSummary["id"];
  }): void {
    this.workspaceService.removeUserImportedProjects(params);
    try {
      return this.projectImportationEntitiesStore.deleteEntity(params.projectImportationId);
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
  }

  async deleteRequest(params: { projectImportationId: ProjectImportation["id"]; workspaceId: WorkspaceSummary["id"] }) {
    await lastValueFrom(this.importationsApiService.delete({ projectImportationId: params.projectImportationId }));
    this.deleteEntitySummary(params);
  }
}
