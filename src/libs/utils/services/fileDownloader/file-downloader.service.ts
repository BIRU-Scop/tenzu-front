/*
 * Copyright (C) 2025-2026 BIRU
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
import { lastValueFrom } from "rxjs";
import { makeOptions, QueryParams } from "@tenzu/repository/base/utils";
import { FileValue } from "@tenzu/repository/base/misc.model";

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

  convertFileToBase64(file: FileValue): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      }
    });
  }

  async convertUrlToBase64(url: string, params?: QueryParams): Promise<string> {
    const blob = await lastValueFrom(
      this.http.get(url, {
        responseType: "blob",
        params: params ? makeOptions(params) : {},
      }),
    );

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
