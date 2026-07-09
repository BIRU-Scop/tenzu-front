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

import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Notification, notificationSchema, NotificationCount, notificationCountSchema } from "./notifications.model";
import { ConfigAppService } from "../config-app/config-app.service";
import { BaseDataModel } from "../base/misc.model";
import { parseWithDebug } from "../base/parse-with-debug";
import { z } from "zod/v4";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  url = this.configAppService.apiUrl();
  notificationsUrl = `${this.url}/notifications`;

  list(): Observable<Notification[]> {
    return this.http
      .get<BaseDataModel<unknown>>(`${this.notificationsUrl}`)
      .pipe(map((dataObject) => parseWithDebug(z.array(notificationSchema), dataObject.data)));
  }

  readAll() {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.notificationsUrl}/read`, {})
      .pipe(map((dataObject) => parseWithDebug(z.array(notificationSchema), dataObject.data)));
  }
  count(): Observable<NotificationCount> {
    return this.http
      .get<unknown>(`${this.notificationsUrl}/count`)
      .pipe(map((data) => parseWithDebug(notificationCountSchema, data)));
  }

  read(notificationId: string): Observable<Notification> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.notificationsUrl}/${notificationId}/read`, null)
      .pipe(map((dataObject) => parseWithDebug(notificationSchema, dataObject.data)));
  }
}
