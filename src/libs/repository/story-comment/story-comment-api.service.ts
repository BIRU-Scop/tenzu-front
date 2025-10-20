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

import { Injectable } from "@angular/core";
import { AbstractApiService } from "../base";
import { StoryComment } from "./story-comment.model";
import * as CommentApiType from "./story-comment-api.type";
import { Observable } from "rxjs";
import { makeOptions, QueryParams } from "@tenzu/repository/base/utils";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class StoryCommentApiService extends AbstractApiService<
  StoryComment,
  StoryComment,
  CommentApiType.ListEntitiesSummaryParams,
  never,
  CommentApiType.CreateEntityDetailParams,
  never,
  CommentApiType.PatchEntityDetailParams,
  CommentApiType.DeleteEntityDetailParams
> {
  baseUrl = `${this.configAppService.apiUrl()}/projects`;

  protected override getBaseUrl(params: CommentApiType.BaseParams): string {
    return `${this.baseUrl}/${params.projectId}/stories/${params.ref}/comments`;
  }
  protected override getEntityBaseUrl(params: CommentApiType.GetEntityDetailParams): string {
    return `${this.configAppService.apiUrl()}/stories/comments/${params.commentId}`;
  }
  override get(): Observable<StoryComment> {
    throw new Error("Method not implemented.");
  }

  override delete(
    params: CommentApiType.DeleteEntityDetailParams,
    queryParams?: QueryParams,
  ): Observable<StoryComment> {
    return this.http
      .delete<BaseDataModel<StoryComment>>(this.deleteUrl(params), {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => dataObject.data));
  }
}
