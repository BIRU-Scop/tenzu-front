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
import { StoryInfraService } from "./story-infra.service";
import { lastValueFrom } from "rxjs";
import { ServiceStoreEntity } from "../interface";
import {
  Story,
  StoryAssign,
  StoryAttachment,
  StoryCreate,
  StoryDetail,
  StoryReorderPayloadEvent,
  StoryUpdate,
} from "./story.model";
import { StoryDetailStore, StoryStore } from "./story.store";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Status } from "../status";
import { Workflow } from "@tenzu/data/workflow";

@Injectable({
  providedIn: "root",
})
export class StoryService implements ServiceStoreEntity<Story, StoryDetail> {
  private storyInfraService = inject(StoryInfraService);
  private storyStore = inject(StoryStore);
  private storyDetailStore = inject(StoryDetailStore);
  selectedStoryAttachments = this.storyDetailStore.selectedStoryAttachments;
  groupedByStatus = this.storyStore.groupedByStatus;
  selectedEntity = this.storyDetailStore.item;
  entities = this.storyStore.entities;
  entityMap = this.storyStore.entityMap;
  isLoading = signal(false);

  async list(projectId: string, workflowSlug: string, offset: number, limit: number) {
    if (this.storyStore.currentProjectId() === projectId && this.storyStore.currentWorkflowSlug() === workflowSlug) {
      return [];
    } else {
      this.storyStore.setCurrentWorkflowId(projectId, workflowSlug);
    }
    this.isLoading.set(true);
    while (true) {
      const stories = await lastValueFrom(this.storyInfraService.getStories(projectId, workflowSlug, limit, offset));
      this.isLoading.set(false);

      this.storyStore.list(stories);
      this.storyStore.reorder();
      if (stories.length < limit) {
        break;
      }
      offset += limit;
    }
    return [];
  }
  resetEntities(): void {
    this.storyStore.reset();
  }
  fullReset(): void {
    this.resetEntities();
    this.resetSelectedEntity();
  }

  async deleteSelected(projectId: string, ref: number): Promise<StoryDetail | undefined> {
    await lastValueFrom(this.storyInfraService.deleteStory(projectId, ref));
    return this.wsRemoveStory(ref);
  }
  wsRemoveStory(ref: number) {
    this.storyStore.removeStory(ref);
    if (ref === this.storyDetailStore.item()?.ref) {
      this.storyDetailStore.resetOverride();
    }
    return undefined;
  }
  async create(story: StoryCreate, projectId: string, workflowSlug: string): Promise<StoryDetail> {
    const newStory = await lastValueFrom(this.storyInfraService.create(projectId, workflowSlug, story));
    this.add(newStory);
    return newStory;
  }
  add(story: Story) {
    this.storyStore.add(story);
  }
  async get(projectId: string, ref: number) {
    const story = await lastValueFrom(this.storyInfraService.get(projectId, ref));
    const attachments = await lastValueFrom(this.storyInfraService.getAttachments(projectId, ref));
    this.storyStore.update(story);
    this.storyDetailStore.set(story);
    this.storyDetailStore.setStoryAttachments(attachments);
    return story;
  }
  async updateSelected(data: StoryUpdate, projectId: string): Promise<StoryDetail | undefined> {
    const storyPatched = await lastValueFrom(this.storyInfraService.patch(projectId, data));
    this.update(storyPatched);
    return storyPatched;
  }
  update(story: StoryDetail) {
    this.storyStore.update(story);
    this.storyDetailStore.set(story);
  }
  updateWorkflowStoryDetail(workflow: Workflow) {
    const story = this.storyDetailStore.item();
    if (story) {
      this.storyDetailStore.patch({ ...story, workflow: { ...workflow } });
    }
  }
  resetSelectedEntity(): void {
    this.storyDetailStore.resetOverride();
  }
  getStoryAttachmentUrl(projectId: string, storyId: number, attachmentId: string) {
    return this.storyInfraService.getStoryAttachmentUrl(projectId, storyId, attachmentId);
  }
  async createAttachment(projectId: string, ref: number, attachment: Blob) {
    const newAttachment = await lastValueFrom(this.storyInfraService.addStoryAttachments(projectId, ref, attachment));
    this.wsAddAttachment(newAttachment, ref);
  }
  wsAddAttachment(attachment: StoryAttachment, ref: number) {
    this.storyDetailStore.addAttachment(attachment, ref);
  }
  async deleteAttachment(projectId: string, ref: number, attachmentId: string) {
    await lastValueFrom(this.storyInfraService.deleteStoryAttachment(projectId, ref, attachmentId));
    this.wsRemoveAttachment(attachmentId);
  }
  wsRemoveAttachment(attachmentId: string) {
    this.storyDetailStore.removeAttachment(attachmentId);
  }
  async createAssign(projectId: string, ref: number, username: string) {
    const storyAssign: StoryAssign = await lastValueFrom(
      this.storyInfraService.createAssignee(projectId, ref, username),
    );
    this.wsAddAssign(storyAssign, ref);
    return storyAssign;
  }
  wsAddAssign(storyAssign: StoryAssign, ref: number) {
    this.storyStore.addAssign(storyAssign, ref);
    this.storyDetailStore.addAssign(storyAssign);
  }

  async deleteAssign(projectId: string, ref: number, username: string) {
    await lastValueFrom(this.storyInfraService.deleteAssignee(projectId, ref, username));
    this.wsRemoveAssign(ref, username);
  }
  wsRemoveAssign(ref: number, username: string) {
    this.storyStore.removeAssign(ref, username);
    this.storyDetailStore.removeAssign(ref, username);
  }
  wsReorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
    this.storyStore.reorderStoryByEvent(reorder);
    this.storyDetailStore.reorderStoryByEvent(reorder);
  }
  async dropStoryIntoSameStatus(event: CdkDragDrop<Status, Status, Story>, projectId: string, workflowSlug: string) {
    const payload = this.storyStore.dropStoryIntoSameStatus(event);
    if (!payload) return;
    await lastValueFrom(this.storyInfraService.reorder(projectId, workflowSlug, payload));
  }
  async dropStoryBetweenStatus(event: CdkDragDrop<Status, Status, Story>, projectId: string, workflowSlug: string) {
    const payload = this.storyStore.dropStoryBetweenStatus(event);
    await lastValueFrom(this.storyInfraService.reorder(projectId, workflowSlug, payload));
  }
  reorder() {
    this.storyStore.reorder();
  }
  deleteStatusGroup(oldStatusId: string, newStatus: Status) {
    this.storyStore.deleteStatusGroup(oldStatusId, newStatus);
  }
}
