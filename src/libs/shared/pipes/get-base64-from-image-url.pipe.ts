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

import { inject, Pipe, PipeTransform } from "@angular/core";
import { FileDownloaderService } from "@tenzu/utils/services/fileDownloader/file-downloader.service";
import { from, Observable, of } from "rxjs";
import { ImageSizeFormat } from "@tenzu/repository/base/misc.model";

@Pipe({ name: "getBase64FromImageUrl" })
export class GetBase64FromImageUrlPipe implements PipeTransform {
  fileDownloaderService = inject(FileDownloaderService);

  transform(imageUrl: string | null | undefined, format: ImageSizeFormat = "small"): Observable<string | null> {
    if (imageUrl) {
      return from(this.fileDownloaderService.convertUrlToBase64(imageUrl, { format }));
    }
    return of(null);
  }
}
