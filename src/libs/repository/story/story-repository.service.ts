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
import { Story, StoryAssign, StoryCreate, StoryDetail, StoryReorderPayloadEvent } from "./story.model";
import { StoryDetailStore, StoryEntitiesSummaryStore } from "./story-entities.store";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { StatusSummary } from "../status";
import { Workflow } from "../workflow";
import { BaseRepositoryService } from "@tenzu/repository/base";
import { EntityId } from "@ngrx/signals/entities";
import { UserNested } from "@tenzu/repository/user";

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
  override getEntityIdFn = (story: Story) => story.ref;
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
  override async createRequest(item: StoryCreate, params: StoryApiServiceType.CreateEntityDetailParams) {
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
  async createAssign(user: UserNested, params: { projectId: StoryDetail["projectId"]; ref: Story["ref"] }) {
    const storyAssign: StoryAssign = await lastValueFrom(this.apiService.createAssignee(user.id, params));
    this.wsAddAssign(storyAssign, params.ref);
    return storyAssign;
  }
  wsAddAssign(storyAssign: StoryAssign, ref: Story["ref"]) {
    this.entitiesSummaryStore.addAssign(storyAssign, ref);

    this.entityDetailStore.addAssign(storyAssign);
  }

  async deleteAssign(assignee: UserNested, params: { projectId: StoryDetail["projectId"]; storyRef: Story["ref"] }) {
    await lastValueFrom(
      this.apiService.deleteAssignee({ projectId: params.projectId, ref: params.storyRef, userId: assignee.id }),
    );
    this.wsRemoveAssign(params.storyRef, assignee.id);
  }
  wsRemoveAssign(ref: Story["ref"], userId: UserNested["id"]) {
    this.entitiesSummaryStore.removeAssign(ref, userId);
    this.entityDetailStore.removeAssign(ref, userId);
  }
  wsReorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
    this.entitiesSummaryStore.reorderStoryByEvent(reorder);
    this.entityDetailStore.reorderStoryByEvent(reorder);
  }
  async dropStoryIntoStatus(
    event: CdkDragDrop<StatusSummary, StatusSummary, Story>,
    projectId: string,
    workflowSlug: string,
  ) {
    const payload = this.entitiesSummaryStore.dropStoryIntoStatus(event, workflowSlug);
    if (!payload) return;
    await lastValueFrom(this.apiService.reorder(payload, { projectId }));
  }

  deleteStatusGroup(oldStatusId: string, newStatus: StatusSummary) {
    this.entitiesSummaryStore.deleteStatusGroup(oldStatusId, newStatus);
  }
}
