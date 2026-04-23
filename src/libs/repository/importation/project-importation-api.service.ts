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
import { makeFormData } from "../base";
import { ProjectImportationPayload, ProjectImportationSummary } from "./importation.model";
import { Observable } from "rxjs";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { WorkspaceSummary } from "@tenzu/repository/workspace";

@Injectable({
  providedIn: "root",
})
export class ProjectImportationApiService {
  protected http = inject(HttpClient);
  protected configAppService = inject(ConfigAppService);

  protected baseUrl = `${this.configAppService.apiUrl()}`;

  createProjectImportation(
    item: ProjectImportationPayload,
    params: { workspaceId: WorkspaceSummary["id"] },
  ): Observable<ProjectImportationSummary> {
    const url = `${this.baseUrl}/workspaces/${params.workspaceId}/projects/importations`;
    const data = makeFormData<ProjectImportationPayload>(item);
    return this.http
      .post<BaseDataModel<ProjectImportationSummary>>(url, data)
      .pipe(map((dataObject) => dataObject.data));
  }
}
