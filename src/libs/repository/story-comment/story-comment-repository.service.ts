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
import { StoryCommentApiService } from "./story-comment-api.service";
import { StoryComment } from "./story-comment.model";
import { StoryCommentDetailStore, StoryCommentEntitiesSummaryStore } from "./story-comment-entities.store";
import { BaseRepositoryService } from "@tenzu/repository/base";
import type * as StoryCommentApiServiceType from "./story-comment-api.type";
import { QueryParams } from "@tenzu/repository/base/utils";
import { lastValueFrom } from "rxjs";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";
import { EntityId } from "@ngrx/signals/entities";
import { Story } from "@tenzu/repository/story";

@Injectable({
  providedIn: "root",
})
export class StoryCommentRepositoryService extends BaseRepositoryService<
  StoryComment,
  StoryComment,
  StoryCommentApiServiceType.ListEntitiesSummaryParams,
  never,
  StoryCommentApiServiceType.CreateEntityDetailParams,
  never,
  StoryCommentApiServiceType.PatchEntityDetailParams,
  StoryCommentApiServiceType.DeleteEntityDetailParams
> {
  protected apiService = inject(StoryCommentApiService);
  protected entitiesSummaryStore = inject(StoryCommentEntitiesSummaryStore);
  protected entityDetailStore = inject(StoryCommentDetailStore);

  listIsComplete = this.entitiesSummaryStore.listIsComplete;
  isLoading = signal(false);

  override async deleteRequest(
    item: StoryComment,
    params: StoryCommentApiServiceType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<StoryComment> {
    const deletedComment = await lastValueFrom(this.apiService.delete(params, queryParams));
    // update to deleted state instead of fully deleting item
    return this.updateEntityDetail(deletedComment);
  }

  override async patchRequest(
    itemId: EntityId,
    partialData: Partial<StoryComment>,
    params: StoryCommentApiServiceType.PatchEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<StoryComment> {
    if (this.entitiesSummaryStore.entityMap()[itemId]) {
      const entity = await lastValueFrom(this.apiService.patch(partialData, params, queryParams));
      return this.updateEntitySummary(itemId, entity);
    }
    throw new NotFoundEntityError(`Entity ${itemId} not found`);
  }

  override async listRequest(
    params: { projectId: Story["projectId"]; ref: Story["ref"] },
    queryParams: { limit: number } = { limit: 10 },
  ) {
    if (this.entitiesSummaryStore.currentStoryRef() === params.ref && this.entitiesSummaryStore.listIsComplete()) {
      return this.entitiesSummary();
    }
    this.entitiesSummaryStore.setCurrentStoryRef(params.ref);
    this.isLoading.set(true);
    let offset = this.entitiesSummaryStore.offset();

    const comments = await lastValueFrom(this.apiService.list(params, { ...queryParams, offset }));
    this.entitiesSummaryStore.addEntities(comments);

    const complete = comments.length < queryParams.limit;
    offset += queryParams.limit;
    this.entitiesSummaryStore.updateListState(offset, complete);
    this.isLoading.set(false);
    return this.entitiesSummary();
  }
}
