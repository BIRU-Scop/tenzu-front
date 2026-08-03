/*
 * Copyright (C) 2024-2026 BIRU
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
import { StorySummary, StoryAssign, StoryCreatePayload, StoryDetail, StoryReorderPayloadEvent } from "./story.model";
import type { StoryTag } from "../story-tag/story-tag.model";
import { StoryTagEntitiesSummaryStore } from "../story-tag/story-tag-entities.store";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "./story-entities.store";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { WorkflowStatusNested } from "../status/status.model";
import { Workflow } from "../workflow/workflow.model";
import { BaseRepositoryService } from "../base/repository.service";
import { EntityId } from "@ngrx/signals/entities";
import { UserNested } from "../user/user.model";
import { NotFoundEntityError } from "../base/errors";

@Injectable({
  providedIn: "root",
})
export class StoryRepositoryService extends BaseRepositoryService<
  StorySummary,
  StoryDetail,
  StoryApiServiceType.ListEntitiesSummaryParams,
  StoryApiServiceType.GetEntityDetailParams,
  StoryApiServiceType.CreateEntityDetailParams,
  StoryApiServiceType.PutEntityDetailParams,
  StoryApiServiceType.PatchEntityDetailParams,
  StoryApiServiceType.DeleteEntityDetailParams,
  StoryCreatePayload
> {
  protected apiService = inject(StoryApiService);
  protected entitiesSummaryStore = inject(StoryEntitiesSummaryStore);
  protected entityDetailStore = inject(StoryDetailStore);
  // The tag STORE (not the tag repository service, since it injects this repository service also and that would cause a DI cycle).
  private storyTagEntitiesSummaryStore = inject(StoryTagEntitiesSummaryStore);
  override getEntityIdFn = (story: StorySummary) => story.ref;
  groupedByStatus = this.entitiesSummaryStore.groupedByStatus;
  isLoading = signal(false);

  reorder = this.entitiesSummaryStore.reorder;
  override setEntitySummary(item: StorySummary) {
    super.setEntitySummary(item);
    this.entitiesSummaryStore.reorder();
  }
  override updateEntitySummary(ref: StorySummary["ref"], partialItem: Partial<StorySummary>): StorySummary {
    const story = super.updateEntitySummary(ref, partialItem);
    this.entitiesSummaryStore.reorder();
    return story;
  }
  override deleteEntitySummary(id: EntityId) {
    super.deleteEntitySummary(id);
    this.entitiesSummaryStore.reorder();
  }

  override async listRequest(
    params: { projectId: StorySummary["projectId"]; workflowId: Workflow["id"] },
    queryParams: { limit: number; offset: number },
  ) {
    if (
      this.entitiesSummaryStore.currentProjectId() === params.projectId &&
      this.entitiesSummaryStore.currentWorkflowId() === params.workflowId
    ) {
      return this.entitiesSummary();
    }
    this.entitiesSummaryStore.setCurrentWorkflowId(params.projectId, params.workflowId);
    this.isLoading.set(true);
    while (true) {
      const stories = await lastValueFrom(this.apiService.list(params, queryParams));
      this.entitiesSummaryStore.addEntities(stories);
      this.entitiesSummaryStore.reorder();

      if (stories.length < queryParams.limit) {
        break;
      }
      queryParams.offset += queryParams.limit;
    }
    this.isLoading.set(false);
    return this.entitiesSummary();
  }

  override async createRequest(item: StoryCreatePayload, params: StoryApiServiceType.CreateEntityDetailParams) {
    const entity = await lastValueFrom(this.apiService.create(item, params));
    this.setEntitySummary(entity);
    this.entitiesSummaryStore.reorder();
    return entity;
  }

  override async getRequest(params: StoryApiServiceType.GetEntityDetailParams) {
    return super.getRequest(params);
  }
  updateWorkflowStoryDetail(workflow: Workflow) {
    const story = this.entityDetailStore.item();
    if (story) {
      this.entityDetailStore.update(story.ref, { ...story, workflow: { ...workflow } });
    }
  }
  async createAssign(user: UserNested, params: { projectId: StoryDetail["projectId"]; ref: StorySummary["ref"] }) {
    const storyAssign: StoryAssign = await lastValueFrom(this.apiService.createAssignee(user.id, params));
    this.wsAddAssign(storyAssign, params.ref);
    return storyAssign;
  }
  wsAddAssign(storyAssign: StoryAssign, ref: StorySummary["ref"]) {
    this.entitiesSummaryStore.addAssign(storyAssign, ref);

    this.entityDetailStore.addAssign(storyAssign);
  }

  async deleteAssign(
    assignee: UserNested,
    params: { projectId: StoryDetail["projectId"]; storyRef: StorySummary["ref"] },
  ) {
    await lastValueFrom(
      this.apiService.deleteAssignee({ projectId: params.projectId, ref: params.storyRef, userId: assignee.id }),
    );
    this.wsRemoveAssign(params.storyRef, assignee.id);
  }
  wsRemoveAssign(ref: StorySummary["ref"], userId: UserNested["id"]) {
    this.entitiesSummaryStore.removeAssign(ref, userId);
    this.entityDetailStore.removeAssign(ref, userId);
  }

  async createTagAssign(
    tagId: StoryTag["id"],
    params: { projectId: StoryDetail["projectId"]; ref: StorySummary["ref"] },
  ) {
    const storyTagAssign = await lastValueFrom(this.apiService.createTagAssignment(tagId, params));
    this.wsAddTag(storyTagAssign.tag.id, params.ref);
    this.storyTagEntitiesSummaryStore.setEntity(storyTagAssign.tag);
    return storyTagAssign;
  }
  async deleteTagAssign(
    tagId: StoryTag["id"],
    params: { projectId: StoryDetail["projectId"]; ref: StorySummary["ref"] },
  ) {
    await lastValueFrom(this.apiService.deleteTagAssignment({ projectId: params.projectId, ref: params.ref, tagId }));
    this.wsRemoveTag(tagId, params.ref);
    this.storyTagEntitiesSummaryStore.decrementStoryCount(tagId);
  }
  wsAddTag(tagId: StoryTag["id"], ref: StorySummary["ref"]) {
    this.entitiesSummaryStore.addTag(tagId, ref);
    this.entityDetailStore.addTag(tagId, ref);
  }
  wsRemoveTag(tagId: StoryTag["id"], ref: StorySummary["ref"]) {
    this.entitiesSummaryStore.removeTag(tagId, ref);
    this.entityDetailStore.removeTag(tagId, ref);
  }
  wsRemoveTagFromStories(tagId: StoryTag["id"]) {
    this.entitiesSummaryStore.removeTagFromStories(tagId);
    this.entityDetailStore.removeTagFromStories(tagId);
  }
  wsReorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
    try {
      this.entitiesSummaryStore.reorderStoryByEvent(reorder);
    } catch (error) {
      if (!(error instanceof NotFoundEntityError)) {
        throw error;
      }
    }
    this.entityDetailStore.reorderStoryByEvent(reorder);
  }
  async dropStoryIntoStatus(
    event: CdkDragDrop<WorkflowStatusNested, WorkflowStatusNested, [StorySummary, number]>,
    workflowId: StorySummary["workflowId"],
  ) {
    const payload = this.entitiesSummaryStore.dropStoryIntoStatus(event);
    if (!payload) return;
    await lastValueFrom(this.apiService.reorder(payload, { workflowId }));
  }

  deleteStatusGroup(oldStatusId: string, newStatus: WorkflowStatusNested) {
    this.entitiesSummaryStore.deleteStatusGroup(oldStatusId, newStatus);
  }

  updateCommentsCount(ref: StorySummary["ref"], increment: number) {
    this.entityDetailStore.updateCommentsCount(ref, increment);
  }
}
