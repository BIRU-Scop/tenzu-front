/*
 * Copyright (C) 2025 BIRU
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
import { HttpClient } from "@angular/common/http";
import { saveAs } from "file-saver-es";

@Injectable({
  providedIn: "root",
})
export class FileDownloaderService {
  http = inject(HttpClient);

  downloadFileFromUrl(url: string, fileName: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const file = new Blob([blob], { type: blob.type });
        saveAs(file, decodeURI(fileName));
      });
  }

  previewFileFromUrl(url: string) {
    this.http
      .get(url, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      });
  }
}
