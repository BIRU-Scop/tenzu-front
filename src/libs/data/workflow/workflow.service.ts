import { inject, Injectable } from "@angular/core";
import { Workflow, WorkflowReorderPayload } from "./workflow.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Status } from "@tenzu/data/status";

@Injectable({
  providedIn: "root",
})
export class WorkflowService {
  http = inject(HttpClient);
  url = `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}/`;

  getUrl(projectId: string) {
    return `${this.url}projects/${projectId}/workflows`;
  }
  create(projectId: string, workflowName: Pick<Workflow, "name">) {
    return this.http.post<Workflow>(`${this.getUrl(projectId)}`, { name: workflowName });
  }
  createStatus(projectId: string, workflowSlug: string, newStatus: Pick<Status, "name">) {
    return this.http.post<Status>(`${this.getUrl(projectId)}/${workflowSlug}/statuses`, newStatus);
  }
  deleteStatus(projectId: string, workflowSlug: string, statusId: string, moveToStatus: string | undefined) {
    return this.http.delete(
      `${this.getUrl(projectId)}/${workflowSlug}/statuses/${statusId}${moveToStatus ? `?moveTo=${moveToStatus}` : ""}`,
    );
  }
  editStatus(projectId: string, workflowSlug: string, status: Pick<Status, "name" | "id">) {
    return this.http.patch<Status>(`${this.getUrl(projectId)}/${workflowSlug}/statuses/${status.id}`, {
      name: status.name,
    });
  }

  list(projectId: string) {
    return this.http.get<Workflow[]>(`${this.getUrl(projectId)}`);
  }
  getById(projectId: string, workflowId: string) {
    return this.http.get<Workflow>(`${this.getUrl(projectId)}/by_id/${workflowId}`);
  }
  get(projectId: string, workflowSlug: string) {
    return this.http.get<Workflow>(`${this.getUrl(projectId)}/${workflowSlug}`);
  }
  reorderStatus(projectId: string, workflowSlug: string, payload: WorkflowReorderPayload) {
    return this.http.post(`${this.getUrl(projectId)}/${workflowSlug}/statuses/reorder`, payload);
  }
}
