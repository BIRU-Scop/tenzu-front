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
import { ProjectRolesApiService } from "./project-roles-api.service";
import { ProjectRolesEntitiesSummaryStore, ProjectRolesDetailStore } from "./project-roles-entities.store";
import { BaseRepositoryService } from "../base";
import type * as ProjectRolesApiServiceType from "./project-roles-api.type";
import { ProjectRoleDetail, ProjectRoleSummary } from "./project-roles.model";

@Injectable({
  providedIn: "root",
})
export class ProjectRolesRepositoryService extends BaseRepositoryService<
  ProjectRoleSummary,
  ProjectRoleDetail,
  ProjectRolesApiServiceType.ListEntitiesSummaryParams,
  ProjectRolesApiServiceType.GetEntityDetailParams,
  ProjectRolesApiServiceType.CreateEntityDetailParams,
  ProjectRolesApiServiceType.PutEntityDetailParams,
  ProjectRolesApiServiceType.PatchEntityDetailParams,
  ProjectRolesApiServiceType.DeleteEntityDetailParams
> {
  protected apiService = inject(ProjectRolesApiService);
  protected entitiesSummaryStore = inject(ProjectRolesEntitiesSummaryStore);
  protected entityDetailStore = inject(ProjectRolesDetailStore);
  defaultRole = this.entitiesSummaryStore.defaultRole;
  ownerRole = this.entitiesSummaryStore.ownerRole;
}
