/*
 * Copyright (C) 2024-2026 BIRU
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

import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { z } from "zod/v4";
import { Language, languageSchema } from "./language.model";
import { TranslocoService } from "@jsverse/transloco";
import { ConfigAppService } from "../config-app/config-app.service";
import { BaseDataModel } from "../base/misc.model";
import { parseWithDebug } from "../base/parse-with-debug";

@Injectable({
  providedIn: "root",
})
export class SystemApiService {
  http = inject(HttpClient);
  translocoService = inject(TranslocoService);
  configAppService = inject(ConfigAppService);

  initLanguage() {
    return this.getLanguages().pipe(
      map((langs) => {
        const availableCodes = langs.map((lang) => lang.code);
        const defaultLang = langs.find((lang) => lang.isDefault);

        this.translocoService.setAvailableLangs(availableCodes);

        if (defaultLang) {
          this.translocoService.setDefaultLang(defaultLang.code);
          this.translocoService.setFallbackLangForMissingTranslation({
            fallbackLang: defaultLang.code,
          });
        }
        return langs;
      }),
    );
  }
  getLanguages(): Observable<Language[]> {
    return this.http
      .get<BaseDataModel<unknown>>(`${this.configAppService.apiUrl()}/system/languages`)
      .pipe(map((dataObject) => parseWithDebug(z.array(languageSchema), dataObject.data)));
  }
}
