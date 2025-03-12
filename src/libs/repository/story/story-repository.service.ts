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

import { inject, Injectable, signal } from "@angular/core";
import { StoryApiService } from "./story-api.service";
import { lastValueFrom } from "rxjs";
import type * as StoryApiServiceType from "./story-api.type";
import { Story, StoryAssign, StoryAttachment, StoryDetail, StoryReorderPayloadEvent } from "./story.model";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "./story-entities.store";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Status } from "../status";
import { Workflow } from "../workflow";
import { BaseRepositoryService } from "@tenzu/repository/base";
import { EntityId } from "@ngrx/signals/entities";

@Injectable({
  providedIn: "root",
})
export class StoryRepositoryService extends BaseRepositoryService<
  Story,
  StoryDetail,
  StoryApiServiceType.ListEntitiesSummaryParams,
  StoryApiServiceType.GetEntityDetailParams,
  StoryApiServiceType.CreateEntityDetailParams,
  StoryApiServiceType.PutEntityDetailParams,
  StoryApiServiceType.PatchEntityDetailParams,
  StoryApiServiceType.DeleteEntityDetailParams
> {
  protected apiService = inject(StoryApiService);
  protected entitiesSummaryStore = inject(StoryEntitiesSummaryStore);
  protected entityDetailStore = inject(StoryDetailStore);
  selectedStoryAttachments = this.entityDetailStore.selectedStoryAttachments;
  groupedByStatus = this.entitiesSummaryStore.groupedByStatus;
  isLoading = signal(false);

  override setEntitySummary(item: Story) {
    super.setEntitySummary(item);
    this.entitiesSummaryStore.reorder();
  }
  override updateEntitySummary(ref: Story["ref"], partialItem: Partial<Story>): Story {
    const story = super.updateEntitySummary(ref, partialItem);
    this.entitiesSummaryStore.reorder();
    return story;
  }
  override deleteEntitySummary(id: EntityId) {
    super.deleteEntitySummary(id);
    this.entitiesSummaryStore.reorder();
  }

  override async listRequest(
    params: StoryApiServiceType.ListEntitiesSummaryParams,
    queryParams: { limit: number; offset: number },
  ) {
    if (
      this.entitiesSummaryStore.currentProjectId() === params.projectId &&
      this.entitiesSummaryStore.currentWorkflowSlug() === params.workflowSlug
    ) {
      return this.entitiesSummary();
    } else {
      this.entitiesSummaryStore.setCurrentWorkflowId(params.projectId, params.workflowSlug);
    }
    this.isLoading.set(true);
    while (true) {
      const stories = await lastValueFrom(this.apiService.list(params, queryParams));
      this.isLoading.set(false);

      this.entitiesSummaryStore.addEntities(stories);
      this.entitiesSummaryStore.reorder();
      if (stories.length < queryParams.limit) {
        break;
      }
      queryParams.offset += queryParams.limit;
    }
    return this.entitiesSummary();
  }

  override async getRequest(params: StoryApiServiceType.GetEntityDetailParams) {
    const story = super.getRequest(params);
    const attachments = await lastValueFrom(this.apiService.getAttachments(params));
    this.entityDetailStore.setStoryAttachments(attachments);
    return story;
  }
  updateWorkflowStoryDetail(workflow: Workflow) {
    const story = this.entityDetailStore.item();
    if (story) {
      this.entityDetailStore.update(story.ref, { ...story, workflow: { ...workflow } });
    }
  }
  getStoryAttachmentUrl(projectId: string, ref: number, attachmentId: string) {
    return `${this.apiService.baseStoryAttachmentUrl({ projectId, ref })}/${attachmentId}`;
  }
  async createAttachment(projectId: string, ref: number, attachment: Blob) {
    const newAttachment = await lastValueFrom(this.apiService.addStoryAttachments(attachment, { projectId, ref }));
    this.wsAddAttachment(newAttachment, ref);
  }
  wsAddAttachment(attachment: StoryAttachment, ref: number) {
    this.entityDetailStore.addAttachment(attachment, ref);
  }
  async deleteAttachment(projectId: string, ref: number, attachmentId: string) {
    await lastValueFrom(this.apiService.deleteStoryAttachment({ projectId, ref, attachmentId }));
    this.wsRemoveAttachment(attachmentId);
  }
  wsRemoveAttachment(attachmentId: string) {
    this.entityDetailStore.removeAttachment(attachmentId);
  }
  async createAssign(projectId: string, ref: number, username: string) {
    const storyAssign: StoryAssign = await lastValueFrom(this.apiService.createAssignee(username, { projectId, ref }));
    this.wsAddAssign(storyAssign, ref);
    return storyAssign;
  }
  wsAddAssign(storyAssign: StoryAssign, ref: number) {
    this.entitiesSummaryStore.addAssign(storyAssign, ref);
    this.entityDetailStore.addAssign(storyAssign);
  }

  async deleteAssign(projectId: string, ref: number, username: string) {
    await lastValueFrom(this.apiService.deleteAssignee({ projectId, ref, username }));
    this.wsRemoveAssign(ref, username);
  }
  wsRemoveAssign(ref: number, username: string) {
    this.entitiesSummaryStore.removeAssign(ref, username);
    this.entityDetailStore.removeAssign(ref, username);
  }
  wsReorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
    this.entitiesSummaryStore.reorderStoryByEvent(reorder);
    this.entityDetailStore.reorderStoryByEvent(reorder);
  }
  async dropStoryIntoStatus(
    event: CdkDragDrop<Status, Status, [Story, number]>,
    projectId: string,
    workflowSlug: string,
  ) {
    const payload = this.entitiesSummaryStore.dropStoryIntoStatus(event);
    if (!payload) return;
    await lastValueFrom(this.apiService.reorder(payload, { projectId, workflowSlug }));
  }

  deleteStatusGroup(oldStatusId: string, newStatus: Status) {
    this.entitiesSummaryStore.deleteStatusGroup(oldStatusId, newStatus);
  }
}
