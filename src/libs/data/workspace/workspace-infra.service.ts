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

import { Injectable } from "@angular/core";
import { Workspace, WorkspaceInvitationInfo } from "./workspace.model";
import { GenericCrudService } from "../generic-crud";
import { Project, ProjectFilter } from "../project";

@Injectable({
  providedIn: "root",
})
export class WorkspaceInfraService extends GenericCrudService<Workspace, ProjectFilter> {
  myWorkspacesUrl = `${this.url}my/workspaces`;
  override endPoint = "workspaces";

  override list() {
    return this.http.get<Workspace[]>(`${this.myWorkspacesUrl}`);
  }

  getProjects(workspaceId: string) {
    return this.http.get<Project[]>(`${this.getUrl()}/${workspaceId}/projects`);
  }

  getInvitationDetail(token: string) {
    return this.http.get<WorkspaceInvitationInfo>(`${this.getUrl()}/invitations/${token}`);
  }

  acceptInvitation(token: string) {
    return this.http.post<WorkspaceInvitationInfo>(`${this.getUrl()}/invitations/${token}/accept`, token);
  }
}
