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

import { EntityId } from "@ngrx/signals/entities";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigAppService } from "../../../app/config-app/config-app.service";
import { makeOptions, QueryParams, retryWhenErrors } from "./utils";
import { BaseDataModel, JsonObject } from "./misc.model";

type OptionRequest = {
  dataIsFormData?: boolean;
};

export abstract class AbstractApiServiceDetail<
  EntityDetailModel extends JsonObject,
  GetParams extends Record<string, EntityId> | unknown = { id: EntityId },
  CreateParams extends Record<string, EntityId> | unknown | undefined = undefined,
  PutParams extends Record<string, EntityId> | unknown = GetParams,
  PatchParams extends Record<string, EntityId> | unknown = GetParams,
  DeleteParams extends Record<string, EntityId> | unknown = GetParams,
> {
  protected http = inject(HttpClient);
  protected configAppService = inject(ConfigAppService);

  protected abstract baseUrl: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getBaseUrl(params?: Record<string, EntityId> | unknown): string {
    return `${this.baseUrl}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getEntityBaseUrl(params: Record<string, EntityId> | unknown): string {
    throw new Error("Not implemented");
  }

  protected getUrl(params: GetParams): string {
    return this.getEntityBaseUrl(params);
  }

  protected createUrl(params?: CreateParams): string {
    return this.getBaseUrl(params);
  }

  protected patchUrl(params: PatchParams): string {
    return this.getEntityBaseUrl(params);
  }

  protected putUrl(params: PutParams): string {
    return this.getEntityBaseUrl(params);
  }

  protected deleteUrl(params: DeleteParams): string {
    return this.getEntityBaseUrl(params);
  }

  get(params: GetParams, queryParams?: QueryParams): Observable<EntityDetailModel> {
    return this.http
      .get<BaseDataModel<EntityDetailModel>>(this.getUrl(params), {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(
        retryWhenErrors(),
        map((dataObject) => dataObject.data),
      );
  }

  patch(
    item: Partial<EntityDetailModel>,
    params: PatchParams,
    queryParams?: QueryParams,
    options?: OptionRequest,
  ): Observable<EntityDetailModel> {
    let data: FormData | Partial<EntityDetailModel>;
    if (options?.dataIsFormData) {
      data = makeFormData<Partial<EntityDetailModel>>(item);
    } else {
      data = item;
    }
    return this.http
      .patch<BaseDataModel<EntityDetailModel>>(this.patchUrl(params), data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(
        retryWhenErrors(),
        map((dataObject) => dataObject.data),
      );
  }

  put(
    item: EntityDetailModel,
    params: PutParams,
    queryParams?: QueryParams,
    options?: OptionRequest,
  ): Observable<EntityDetailModel> {
    let data: FormData | EntityDetailModel;
    if (options?.dataIsFormData) {
      data = makeFormData<EntityDetailModel>(item);
    } else {
      data = item;
    }
    return this.http
      .put<BaseDataModel<EntityDetailModel>>(this.putUrl(params), data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(
        retryWhenErrors(),
        map((dataObject) => dataObject.data),
      );
  }

  create(
    item: Partial<EntityDetailModel>,
    params?: CreateParams,
    queryParams?: QueryParams,
    options?: OptionRequest,
  ): Observable<EntityDetailModel> {
    const url = Object.keys(params || {}).length > 0 ? this.createUrl(params) : this.createUrl();
    let data: FormData | Partial<EntityDetailModel>;
    if (options?.dataIsFormData) {
      data = makeFormData<Partial<EntityDetailModel>>(item);
    } else {
      data = item;
    }
    return this.http
      .post<BaseDataModel<EntityDetailModel>>(url, data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(
        retryWhenErrors(),
        map((dataObject) => dataObject.data),
      );
  }

  delete(params: DeleteParams, queryParams?: QueryParams): Observable<void | EntityDetailModel> {
    return this.http
      .delete<void>(this.deleteUrl(params), {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(retryWhenErrors());
  }
}

export abstract class AbstractApiService<
  EntityListModel extends JsonObject,
  EntityDetailModel extends EntityListModel = EntityListModel,
  ListParams extends Record<string, EntityId> | unknown = undefined,
  GetParams extends Record<string, EntityId> | unknown = { id: EntityId },
  CreateParams extends Record<string, EntityId> | unknown = undefined,
  PutParams extends Record<string, EntityId> | unknown = GetParams,
  PatchParams extends Record<string, EntityId> | unknown = GetParams,
  DeleteParams extends Record<string, EntityId> | unknown = GetParams,
> extends AbstractApiServiceDetail<EntityDetailModel, GetParams, CreateParams, PutParams, PatchParams, DeleteParams> {
  protected listUrl(params?: ListParams): string {
    return `${this.getBaseUrl(params)}`;
  }

  list(params?: ListParams, queryParams?: QueryParams): Observable<EntityListModel[]> {
    const url = params ? this.listUrl(params) : this.listUrl();
    return this.http
      .get<BaseDataModel<EntityListModel[]>>(url, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(
        retryWhenErrors(),
        map((dataObject) => dataObject.data),
      );
  }
}

function makeFormData<T extends JsonObject>(item: T): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(item)) {
    if (value === undefined || value === null) {
      // Ignore null/undefined values
    } else if (typeof value === "object") {
      // Convert objects and tables to json string
      formData.append(key, JSON.stringify(value));
    } else {
      // Stringify primitives (number, boolean, string)
      formData.append(key, String(value));
    }
  }
  return formData;
}
