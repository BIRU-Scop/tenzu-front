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
  Story,
  StoryAssign,
  StoryAttachment,
  StoryCreate,
  StoryDetail,
  StoryReorderPayload,
  StoryUpdate,
} from "./story.model";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

@Injectable({
  providedIn: "root",
})
export class StoryInfraService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  url = `${this.configAppService.apiUrl()}`;

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
    return this.http.post<StoryDetail>(`${this.getWorkflowStoryUrl(projectId, workflowSlug)}`, Story);
  }

  getStories(projectId: string, workflowSlug: string, limit: number, offset: number) {
    return this.http.get<Story[]>(
      `${this.getWorkflowStoryUrl(projectId, workflowSlug)}?offset=${offset}&limit=${limit}`,
    );
  }

  get(projectId: string, ref: number) {
    return this.http.get<StoryDetail>(`${this.getStoryUrl(projectId)}/${ref}`);
  }

  patch(projectId: string, story: StoryUpdate) {
    return this.http.patch<StoryDetail>(`${this.getStoryUrl(projectId)}/${story.ref}`, story);
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
