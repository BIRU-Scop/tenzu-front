import { Injectable } from "@angular/core";
import { Workspace, WorkspaceInvitationInfo } from "./workspace.model";
import { GenericCrudService } from "../generic-crud";
import { Project, ProjectFilter } from "../project";

@Injectable({
  providedIn: "root",
})
export class WorkspaceService extends GenericCrudService<Workspace, ProjectFilter> {
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
