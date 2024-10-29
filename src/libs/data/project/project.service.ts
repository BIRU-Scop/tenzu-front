import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericCrudService } from "../generic-crud";
import { ProjectInvitationInfo } from "@tenzu/data/workspace";
import { Project, ProjectBase, ProjectCreation, ProjectFilter, ProjectInvitationAccept } from "./project.model";

@Injectable({
  providedIn: "root",
})
export class ProjectService extends GenericCrudService<Project, ProjectFilter> {
  override endPoint = `projects`;

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

  getWorkspaceProjects(workspace_id: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.getUrl()}/workspaces/${workspace_id}/projects`);
  }

  getInvitedProjects(workspace_id: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.getUrl()}/workspaces/${workspace_id}/invited-projects`);
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

  acceptInvitation(token: string) {
    return this.http.post<ProjectInvitationAccept>(`${this.getUrl()}/invitations/${token}/accept`, token);
  }
}
