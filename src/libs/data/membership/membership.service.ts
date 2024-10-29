import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  ProjectMembership,
  WorkspaceGuest,
  Invitation,
  WorkspaceMembership,
  InvitationsResponse,
} from "@tenzu/data/membership/membership.model";
import { API_URL } from "@tenzu/data/generic-crud";

@Injectable({
  providedIn: "root",
})
export class MembershipService {
  http = inject(HttpClient);
  url = API_URL;
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
