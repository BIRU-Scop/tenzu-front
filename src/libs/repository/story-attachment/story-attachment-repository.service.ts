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
import { StoryAttachmentApiService } from "./story-attachment-api.service";
import { StoryAttachment } from "./story-attachment.model";
import { StoryAttachmentDetailStore, StoryAttachmentEntitiesSummaryStore } from "./story-attachment-entities.store";
import { BaseRepositoryService } from "@tenzu/repository/base";
import type * as StoryAttachmentApiServiceType from "./story-attachment-api.type";
import * as StoryAttachmentApiType from "@tenzu/repository/story-attachment/story-attachment-api.type";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StoryAttachmentRepositoryService extends BaseRepositoryService<
  StoryAttachment,
  StoryAttachment,
  StoryAttachmentApiServiceType.ListEntitiesSummaryParams,
  StoryAttachmentApiServiceType.GetEntityDetailParams,
  StoryAttachmentApiServiceType.CreateEntityDetailParams,
  StoryAttachmentApiServiceType.PutEntityDetailParams,
  StoryAttachmentApiServiceType.PatchEntityDetailParams,
  StoryAttachmentApiServiceType.DeleteEntityDetailParams
> {
  protected apiService = inject(StoryAttachmentApiService);
  protected entitiesSummaryStore = inject(StoryAttachmentEntitiesSummaryStore);
  protected entityDetailStore = inject(StoryAttachmentDetailStore);

  async createAttachment(attachment: Blob | File, params: StoryAttachmentApiType.CreateEntityDetailParams) {
    const entity = await lastValueFrom(this.apiService.createAttachment(attachment, params));
    this.setEntityDetail(entity);
    return entity;
  }
  downloadAttachment(attachment: StoryAttachment) {
    this.apiService.downloadAttachment(attachment);
  }
  previewAttachment(attachment: StoryAttachment) {
    this.apiService.previewAttachment(attachment);
  }
}
