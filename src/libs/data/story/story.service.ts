import { inject, Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Story, StoryCreate, StoryDetail, StoryReorderPayload, StoryAttachment, StoryAssign } from "./story.model";

@Injectable({
  providedIn: "root",
})
export class StoryService {
  http = inject(HttpClient);
  url = `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}/`;

  getWorkflowStoryUrl(projectId: string, workflowSlug: string) {
    return `${this.url}projects/${projectId}/workflows/${workflowSlug}/stories`;
  }

  getStoryUrl(projectId: string) {
    return `${this.url}projects/${projectId}/stories`;
  }

  getStoryAttachmentUrl(projectId: string, storyId: number, attachmentId: string) {
    return `${this.getStoryUrl(projectId)}/${storyId}/attachments/${attachmentId}`;
  }

  create(projectId: string, workflowSlug: string, Story: StoryCreate) {
    return this.http.post<Story>(`${this.getWorkflowStoryUrl(projectId, workflowSlug)}`, Story);
  }

  getStories(projectId: string, workflowSlug: string, limit: number, offset: number) {
    return this.http.get<Story[]>(
      `${this.getWorkflowStoryUrl(projectId, workflowSlug)}?offset=${offset}&limit=${limit}`,
    );
  }

  get(projectId: string, ref: number) {
    return this.http.get<StoryDetail>(`${this.getStoryUrl(projectId)}/${ref}`);
  }

  patch(projectId: string, story: StoryDetail) {
    const data = {
      title: story.title,
      description: story.description,
      version: story.version,
      status: story.status.id,
    };
    return this.http.patch<StoryDetail>(`${this.getStoryUrl(projectId)}/${story.ref}`, data);
  }

  deleteStory(projectId: string, ref: number) {
    return this.http.delete(`${this.getStoryUrl(projectId)}/${ref}`);
  }

  addStoryAttachments(projectId: string, storyId: number, attachment: Blob) {
    const formData = new FormData();
    formData.append("file", attachment);
    return this.http.post<StoryAttachment>(`${this.getStoryUrl(projectId)}/${storyId}/attachments`, formData);
  }

  getAttachments(projectId: string, storyId: number) {
    return this.http.get<StoryAttachment[]>(`${this.getStoryUrl(projectId)}/${storyId}/attachments`);
  }

  deleteStoryAttachment(projectId: string, storyId: number, attachmentId: string) {
    return this.http.delete(`${this.getStoryAttachmentUrl(projectId, storyId, attachmentId)}`);
  }
  reorder(projectId: string, workflowSlug: string, payload: StoryReorderPayload) {
    return this.http.post<never>(`${this.getWorkflowStoryUrl(projectId, workflowSlug)}/reorder`, payload);
  }
  createAssignee(projectId: string, ref: number, username: string) {
    return this.http.post<StoryAssign>(`${this.getStoryUrl(projectId)}/${ref}/assignments`, { username: username });
  }
  deleteAssignee(projectId: string, ref: number, username: string) {
    return this.http.delete<void>(`${this.getStoryUrl(projectId)}/${ref}/assignments/${username}`);
  }
}
