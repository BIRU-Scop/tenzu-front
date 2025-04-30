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
import type * as StoryApiServiceType from "./story-api.type";
import { Injectable } from "@angular/core";
import {
  Story,
  StoryAssign,
  StoryAttachment,
  StoryCreate,
  StoryDetail,
  StoryReorderPayload,
  StoryUpdate,
} from "./story.model";
import { AbstractApiService } from "../base";
import { UserNested } from "@tenzu/repository/user";

@Injectable({
  providedIn: "root",
})
export class StoryApiService extends AbstractApiService<
  Story,
  StoryDetail,
  StoryApiServiceType.ListEntitiesSummaryParams,
  StoryApiServiceType.GetEntityDetailParams,
  StoryApiServiceType.CreateEntityDetailParams,
  StoryApiServiceType.PutEntityDetailParams,
  StoryApiServiceType.PatchEntityDetailParams,
  StoryApiServiceType.DeleteEntityDetailParams
> {
  baseUrl = `${this.configAppService.apiUrl()}projects`;

  protected override getBaseUrl(params: { projectId: string }): string {
    return `${this.baseUrl}/${params.projectId}/stories`;
  }
  protected override getEntityBaseUrl(params: StoryApiServiceType.BaseParams): string {
    return `${this.getBaseUrl(params)}/${params.ref}`;
  }

  protected baseStoryFilterByWorkflowSlugUrl(params: { projectId: string; workflowSlug: string }) {
    return `${this.baseUrl}/${params.projectId}/workflows/${params.workflowSlug}/stories`;
  }

  public baseStoryAttachmentUrl(params: StoryApiServiceType.BaseParams) {
    return `${this.getEntityBaseUrl(params)}/attachments`;
  }

  public baseStoryAssignmentUrl(params: StoryApiServiceType.BaseParams) {
    return `${this.getEntityBaseUrl(params)}/assignments`;
  }

  protected override listUrl(params: StoryApiServiceType.ListEntitiesSummaryParams) {
    return `${this.baseStoryFilterByWorkflowSlugUrl(params)}`;
  }

  override create(story: StoryCreate, params: StoryApiServiceType.CreateEntityDetailParams) {
    return super.create(story, params);
  }

  override list(params: StoryApiServiceType.ListEntitiesSummaryParams, queryParams: { limit: number; offset: number }) {
    return super.list(params, queryParams);
  }
  override patch(story: StoryUpdate, params: StoryApiServiceType.PatchEntityDetailParams) {
    return super.patch(story, params);
  }

  addStoryAttachments(attachment: Blob, params: StoryApiServiceType.BaseParams) {
    const formData = new FormData();
    formData.append("file", attachment);
    return this.http.post<StoryAttachment>(`${this.baseStoryAttachmentUrl(params)}`, formData);
  }

  getAttachments(params: StoryApiServiceType.BaseParams) {
    return this.http.get<StoryAttachment[]>(`${this.baseStoryAttachmentUrl(params)}`);
  }

  deleteStoryAttachment(params: StoryApiServiceType.GetEntityDetailParams & { attachmentId: string }) {
    return this.http.delete(`${this.baseStoryAttachmentUrl(params)}/${params.attachmentId}`);
  }
  reorder(payload: StoryReorderPayload, params: { projectId: string }) {
    return this.http.post<never>(`${this.getBaseUrl(params)}/reorder`, payload);
  }
  createAssignee(username: UserNested["username"], params: StoryApiServiceType.BaseParams) {
    return this.http.post<StoryAssign>(`${this.baseStoryAssignmentUrl(params)}`, { username });
  }
  deleteAssignee(params: StoryApiServiceType.BaseParams & { username: UserNested["username"] }) {
    return this.http.delete<void>(`${this.baseStoryAssignmentUrl(params)}/${params.username}`);
  }
}
