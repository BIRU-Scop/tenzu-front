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

import { Injectable } from "@angular/core";
import { AbstractApiService } from "../base";
import { ProjectDetail } from "../project";
import { ProjectMembership } from "./project-membership.model";
import { Observable } from "rxjs";

export type ListProjectMembershipParams = {
  projectId: string;
};
export type CreateProjectMembershipParams = unknown;
export type GetProjectMembershipParams = unknown;
export type PutProjectMembershipParams = unknown;
export type PatchProjectMembershipParams = { projectId: ProjectDetail["id"]; username: string };
export type DeleteProjectMembershipParams = { projectId: ProjectDetail["id"]; username: string };

@Injectable({
  providedIn: "root",
})
export class ProjectMembershipApiService extends AbstractApiService<
  ProjectMembership,
  ProjectMembership,
  ListProjectMembershipParams,
  GetProjectMembershipParams,
  CreateProjectMembershipParams,
  PutProjectMembershipParams,
  PatchProjectMembershipParams,
  DeleteProjectMembershipParams
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}projects`;
  protected override getBaseUrl(params: { projectId: ProjectDetail["id"] }) {
    return `${this.baseUrl}/${params.projectId}/memberships`;
  }
  protected override getEntityBaseUrl(params: { projectId: ProjectDetail["id"]; username: string }): string {
    return `${this.getBaseUrl(params)}/${params.username}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override create(item: Partial<ProjectMembership>): Observable<ProjectMembership> {
    throw new Error("Method not implemented.");
  }
  override get(): Observable<ProjectMembership> {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override put(item: Partial<ProjectMembership>): Observable<ProjectMembership> {
    throw new Error("Method not implemented.");
  }
}
