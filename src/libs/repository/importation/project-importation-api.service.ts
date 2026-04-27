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

import { Injectable } from "@angular/core";
import { AbstractApiService } from "../base";
import { CreateProjectImportationPayload, ProjectImportation } from "./importation.model";
import { Observable } from "rxjs";
import type * as ProjectImportationApiServiceType from "./importation-api.type";

@Injectable({
  providedIn: "root",
})
export class ProjectImportationApiService extends AbstractApiService<
  ProjectImportation,
  ProjectImportation,
  ProjectImportationApiServiceType.ListEntitiesSummaryParams,
  unknown,
  ProjectImportationApiServiceType.CreateEntityDetailParams,
  unknown,
  unknown,
  ProjectImportationApiServiceType.DeleteEntityDetailParams,
  CreateProjectImportationPayload
> {
  baseUrl = `${this.configAppService.apiUrl()}/projects/importations`;
  protected override getBaseUrl(params: ProjectImportationApiServiceType.ListEntitiesSummaryParams) {
    return `${this.configAppService.apiUrl()}/workspaces/${params.workspaceId}/projects/importations`;
  }
  protected override getEntityBaseUrl(params: ProjectImportationApiServiceType.BaseParams) {
    return `${this.baseUrl}/${params.projectImportationId}`;
  }

  override create(
    item: CreateProjectImportationPayload,
    params: ProjectImportationApiServiceType.CreateEntityDetailParams,
    options = { dataIsFormData: true },
  ): Observable<ProjectImportation> {
    return super.create(item, params, {}, options);
  }

  override get(): Observable<ProjectImportation> {
    throw new Error("Method not implemented.");
  }

  override put(): Observable<ProjectImportation> {
    throw new Error("Method not implemented.");
  }

  override patch(): Observable<ProjectImportation> {
    throw new Error("Method not implemented.");
  }
}
