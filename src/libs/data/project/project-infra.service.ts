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
import { Observable } from "rxjs";
import { GenericCrudService } from "../generic-crud";
import { ProjectInvitationInfo } from "@tenzu/data/workspace";
import {
  Project,
  ProjectBase,
  ProjectCreation,
  ProjectFilter,
  ProjectInvitationAccept,
  ProjectSummary,
} from "./project.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProjectInfraService extends GenericCrudService<ProjectSummary, ProjectFilter> {
  override endPoint = `projects`;

  override list(params: ProjectFilter = {} as ProjectFilter) {
    return super.list(params).pipe(map((result) => result as ProjectSummary[]));
  }

  override get(id: string) {
    return super.get(id).pipe(map((result) => result as Project));
  }

  override create(newProject: ProjectCreation): Observable<Project> {
    const formData = new FormData();
    formData.append("name", newProject.name);
    if (newProject.description) {
      formData.append("description", newProject.description);
    }
    formData.append("color", newProject.color.toString());
    formData.append("workspaceId", newProject.workspaceId);

    return this.http.post<Project>(`${this.getUrl()}`, formData);
  }

  // Need to pass by POST method because django ninja don't support PATCH with form
  override patch(id: string, item: Partial<ProjectBase>): Observable<Project> {
    const formData = new FormData();
    for (const [key, value] of Object.entries(item)) {
      formData.append(key, typeof value === "number" ? value.toString() : value);
    }
    return this.http.post<Project>(`${this.getUrl()}/${id}`, formData);
  }

  getWorkspaceProjects(workspaceId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.getUrl()}/workspaces/${workspaceId}/projects`);
  }

  getInvitedProjects(workspaceId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.getUrl()}/workspaces/${workspaceId}/invited-projects`);
  }

  getPublicPermissions(id: number) {
    return this.http.get<string>(`${this.getUrl()}/${id}/public-permissions`);
  }

  updatePublicPermissions(id: number, item: string[]) {
    return this.http.put<void>(`${this.getUrl()}/${id}/public-permissions`, item);
  }

  getProjectInvitationInfo(token: string) {
    return this.http.get<ProjectInvitationInfo>(`${this.getUrl()}/invitations/${token}`);
  }

  acceptInvitationWithToken(token: string) {
    return this.http.post<ProjectInvitationAccept>(`${this.getUrl()}/invitations/${token}/accept`, token);
  }

  acceptInvitationForCurrentUser(projectId: Project["id"]) {
    return this.http.post<ProjectInvitationAccept>(`${this.getUrl()}/${projectId}/invitations/accept`, null);
  }
}
