/*
 * Copyright (C) 2024 BIRU
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

import { inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ConfigAppService } from "../../../app/config-app/config-app.service";

export type ListParams = Record<string, string | number | (string | number)[] | boolean | null>;
export const makeOptions = (params: ListParams) => {
  let options = new HttpParams();
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      if (Array.isArray(params[key])) {
        (params[key] as (string | number)[]).forEach((element) => {
          if (element !== null && element !== undefined) {
            options = options.append(key, element.toString());
          }
        });
      } else {
        if (params[key] !== undefined) {
          options = options.append(key, params[key]?.toString() || "null");
        }
      }
    }
  }
  return options;
};

export class GenericCrudService<Model, Filter> {
  http = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  endPoint = "";
  url = this.configAppService.apiUrl();

  getUrl() {
    return `${this.url}${this.endPoint}`;
  }

  list(params: Filter = {} as Filter) {
    return this.http.get<Model[]>(this.getUrl(), {
      params: params ? makeOptions(params) : {},
    });
  }

  get(id: number | string) {
    return this.http.get<Model>(`${this.getUrl()}/${id}`);
  }

  create(item: Partial<Model>) {
    return this.http.post<Model>(`${this.getUrl()}`, item);
  }

  put(id: number, item: Model) {
    return this.http.put<Model>(`${this.getUrl()}/${id}`, item);
  }

  patch(id: string, item: Partial<Model>) {
    return this.http.patch<Model>(`${this.getUrl()}/${id}`, item);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.getUrl()}/${id}`);
  }
}
