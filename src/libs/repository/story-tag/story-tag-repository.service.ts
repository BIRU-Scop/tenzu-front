/*
 * Copyright (C) 2026 BIRU
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

import { inject, Service } from "@angular/core";
import { EntityId } from "@ngrx/signals/entities";
import { StoryTagApiService } from "./story-tag-api.service";
import { CreateStoryTagPayload, StoryTagWithCount } from "./story-tag.model";
import { StoryTagDetailStore, StoryTagEntitiesSummaryStore } from "./story-tag-entities.store";
import { StoryRepositoryService } from "../story/story-repository.service";
import { BaseRepositoryService } from "../base/repository.service";
import type * as StoryTagApiType from "./story-tag-api.type";
import { QueryParams } from "../base/utils";
import { lastValueFrom } from "rxjs";

@Service()
export class StoryTagRepositoryService extends BaseRepositoryService<
  StoryTagWithCount,
  StoryTagWithCount,
  StoryTagApiType.ListEntitiesSummaryParams,
  StoryTagApiType.GetEntityDetailParams,
  StoryTagApiType.CreateEntityDetailParams,
  StoryTagApiType.PutEntityDetailParams,
  StoryTagApiType.PatchEntityDetailParams,
  StoryTagApiType.DeleteEntityDetailParams
> {
  protected apiService = inject(StoryTagApiService);
  protected entitiesSummaryStore = inject(StoryTagEntitiesSummaryStore);
  protected entityDetailStore = inject(StoryTagDetailStore); //hack
  private storyRepositoryService = inject(StoryRepositoryService);

  override async patchRequest(
    itemId: EntityId,
    payload: CreateStoryTagPayload,
    params: StoryTagApiType.PatchEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<StoryTagWithCount> {
    const entity = await lastValueFrom(this.apiService.patch(payload, params, queryParams));
    this.setEntitySummary(entity);
    return entity;
  }

  override async deleteRequest(
    item: StoryTagWithCount,
    params: StoryTagApiType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Promise<StoryTagWithCount> {
    await lastValueFrom(this.apiService.delete(params, queryParams));
    this.deleteEntitySummary(item.id);
    this.storyRepositoryService.wsRemoveTagFromStories(item.id);
    return item;
  }
}
