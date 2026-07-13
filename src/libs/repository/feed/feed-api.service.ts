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

import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { BaseDataModel } from "../base/misc.model";
import { FeedItem, FeedItemReadState, parseFeedItems, parseFeedItemReadStates } from "./feed-item.model";

@Injectable({
  providedIn: "root",
})
export class FeedApiService {
  private readonly http = inject(HttpClient);
  private readonly configAppService = inject(ConfigAppService);
  private readonly baseUrl = `${this.configAppService.apiUrl()}/feeds`;

  list(): Observable<FeedItem[]> {
    return this.http
      .get<BaseDataModel<unknown>>(this.baseUrl)
      .pipe(map((dataObject) => parseFeedItems(dataObject.data)));
  }

  markRead(params: { ids: string[] }): Observable<FeedItemReadState[]> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.baseUrl}/read`, { ids: params.ids })
      .pipe(map((dataObject) => parseFeedItemReadStates(dataObject.data)));
  }
}
