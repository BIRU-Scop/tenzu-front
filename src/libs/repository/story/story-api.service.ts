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
import { Story, StoryAssign, StoryCreate, StoryDetail, StoryReorderPayload, StoryUpdate } from "./story.model";
import { AbstractApiService } from "../base";
import { UserNested } from "@tenzu/repository/user";
import { Observable } from "rxjs";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";

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
  baseUrl = `${this.configAppService.apiUrl()}`;

  protected override getEntityBaseUrl(params: StoryApiServiceType.BaseParams): string {
    return `${this.baseUrl}/projects/${params.projectId}/stories/${params.ref}`;
  }

  protected override listUrl(params: StoryApiServiceType.ListEntitiesSummaryParams) {
    return `${this.baseUrl}/workflows/${params.workflowId}/stories`;
  }

  protected override createUrl(params: StoryApiServiceType.CreateEntityDetailParams): string {
    return this.listUrl(params);
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

  reorder(payload: StoryReorderPayload, params: StoryApiServiceType.ListEntitiesSummaryParams): Observable<void> {
    return this.http.post<void>(`${this.createUrl(params)}/reorder`, payload);
  }

  public baseStoryAssignmentUrl(params: StoryApiServiceType.BaseParams) {
    return `${this.getEntityBaseUrl(params)}/assignments`;
  }

  createAssignee(userId: UserNested["id"], params: StoryApiServiceType.BaseParams): Observable<StoryAssign> {
    return this.http
      .post<BaseDataModel<StoryAssign>>(`${this.baseStoryAssignmentUrl(params)}`, { userId })
      .pipe(map((dataObject) => dataObject.data));
  }
  deleteAssignee(params: StoryApiServiceType.BaseParams & { userId: UserNested["id"] }) {
    return this.http.delete<void>(`${this.baseStoryAssignmentUrl(params)}/${params.userId}`);
  }
}
