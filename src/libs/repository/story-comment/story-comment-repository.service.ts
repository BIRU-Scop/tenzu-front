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

import { inject, Injectable } from "@angular/core";
import { StoryCommentApiService } from "./story-comment-api.service";
import { StoryComment } from "./story-comment.model";
import { StoryCommentDetailStore, StoryCommentEntitiesSummaryStore } from "./story-comment-entities.store";
import { BaseRepositoryService } from "@tenzu/repository/base";
import type * as StoryCommentApiServiceType from "./story-comment-api.type";

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
}
