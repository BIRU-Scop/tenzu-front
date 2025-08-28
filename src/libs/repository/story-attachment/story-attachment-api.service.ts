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
import { AbstractApiService } from "../base";
import { StoryAttachment } from "./story-attachment.model";
import * as StoryAttachmentApiType from "./story-attachment-api.type";
import { FileDownloaderService } from "@tenzu/utils/services/fileDownloader/file-downloader.service";
import { Observable } from "rxjs";
import { BaseDataModel } from "@tenzu/repository/base/misc.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class StoryAttachmentApiService extends AbstractApiService<
  StoryAttachment,
  StoryAttachment,
  StoryAttachmentApiType.ListEntitiesSummaryParams,
  StoryAttachmentApiType.GetEntityDetailParams,
  StoryAttachmentApiType.CreateEntityDetailParams,
  never,
  never,
  StoryAttachmentApiType.DeleteEntityDetailParams
> {
  baseUrl = `${this.configAppService.apiUrl()}/projects`;
  fileDownloaderService = inject(FileDownloaderService);

  protected override getBaseUrl(params: StoryAttachmentApiType.BaseParams): string {
    return `${this.baseUrl}/${params.projectId}/stories/${params.ref}/attachments`;
  }
  protected override getEntityBaseUrl(params: StoryAttachmentApiType.GetEntityDetailParams): string {
    return `${this.configAppService.apiUrl()}/stories/attachments/${params.attachmentId}`;
  }

  createAttachment(
    attachment: Blob | File,
    params: StoryAttachmentApiType.CreateEntityDetailParams,
  ): Observable<StoryAttachment> {
    const formData = new FormData();
    formData.append("file", attachment);
    return this.http
      .post<BaseDataModel<StoryAttachment>>(`${this.createUrl(params)}`, formData)
      .pipe(map((dataObject) => dataObject.data));
  }
  downloadAttachment(attachment: StoryAttachment) {
    this.fileDownloaderService.downloadFileFromUrl(
      this.getEntityBaseUrl({ attachmentId: attachment.id }),
      attachment.name,
    );
  }
  previewAttachment(attachment: StoryAttachment) {
    this.fileDownloaderService.previewFileFromUrl(this.getEntityBaseUrl({ attachmentId: attachment.id }));
  }
}
