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
import { HttpClient } from "@angular/common/http";
import {
  Invitation,
  InvitationsResponse,
  ProjectMembership,
  WorkspaceGuest,
  WorkspaceMembership,
} from "@tenzu/data/membership/membership.model";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

@Injectable({
  providedIn: "root",
})
export class MembershipService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  url = this.configAppService.apiUrl();
  projectsUrl = `${this.url}projects`;
  workspacesUrl = `${this.url}workspaces`;

  listProjectMembership(projectId: string) {
    return this.http.get<ProjectMembership[]>(`${this.projectsUrl}/${projectId}/memberships`);
  }

  patchProjectMembership(projectId: string, username: string, value: Partial<ProjectMembership>) {
    return this.http.patch<ProjectMembership>(`${this.projectsUrl}/${projectId}/memberships/${username}`, value);
  }

  deleteProjectMembership(projectId: string, username: string) {
    return this.http.delete<void>(`${this.projectsUrl}/${projectId}/memberships/${username}`);
  }

  listWorkspaceMembership(workspaceId: string) {
    return this.http.get<WorkspaceMembership[]>(`${this.workspacesUrl}/${workspaceId}/memberships`);
  }

  listWorkspaceGuest(workspaceId: string) {
    return this.http.get<WorkspaceGuest[]>(`${this.workspacesUrl}/${workspaceId}/guests`);
  }

  listWorkspaceInvitations(workspaceId: string) {
    return this.http.get<Invitation[]>(`${this.workspacesUrl}/${workspaceId}/invitations`);
  }

  listProjectInvitations(projectId: string) {
    return this.http.get<Invitation[]>(`${this.projectsUrl}/${projectId}/invitations`);
  }

  deleteWorkspaceMembership(workspaceId: string, username: string) {
    return this.http.delete<void>(`${this.workspacesUrl}/${workspaceId}/memberships/${username}`);
  }

  sendWorkspaceInvitations(workspaceId: string, invitationMail: string[]) {
    return this.http.post<InvitationsResponse>(`${this.workspacesUrl}/${workspaceId}/invitations`, {
      invitations: invitationMail.map((value) => {
        return { username_or_email: value };
      }),
    });
  }

  sendProjectInvitations(id: string, mails: string[]) {
    return this.http.post<InvitationsResponse>(`${this.projectsUrl}/${id}/invitations`, {
      invitations: mails.map((value) => {
        // TODO: change role with proper permission later
        return { email: value, roleSlug: "admin" };
      }),
    });
  }
}
