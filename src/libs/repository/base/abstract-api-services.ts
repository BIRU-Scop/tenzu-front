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

import { EntityId } from "@ngrx/signals/entities";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { z } from "zod/v4";
import { ConfigAppService } from "../config-app/config-app.service";
import { makeOptions, QueryParams } from "./utils";
import { BaseDataModel, DataObject, JsonObject } from "./misc.model";
import { parseWithDebug } from "./parse-with-debug";

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
  CreatePayload extends DataObject = Partial<EntityDetailModel>,
> {
  protected http = inject(HttpClient);
  protected configAppService = inject(ConfigAppService);

  protected abstract baseUrl: string;

  protected detailSchema?: z.ZodType<EntityDetailModel>;

  protected parseDetail(data: unknown): EntityDetailModel {
    return this.detailSchema ? parseWithDebug(this.detailSchema, data) : (data as EntityDetailModel);
  }

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
      .get<BaseDataModel<unknown>>(this.getUrl(params), {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => this.parseDetail(dataObject.data)));
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
      .patch<BaseDataModel<unknown>>(this.patchUrl(params), data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => this.parseDetail(dataObject.data)));
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
      .put<BaseDataModel<unknown>>(this.putUrl(params), data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => this.parseDetail(dataObject.data)));
  }

  create(
    item: CreatePayload,
    params?: CreateParams,
    queryParams?: QueryParams,
    options?: OptionRequest,
  ): Observable<EntityDetailModel> {
    const url = Object.keys(params || {}).length > 0 ? this.createUrl(params) : this.createUrl();
    let data: FormData | CreatePayload;
    if (options?.dataIsFormData) {
      data = makeFormData<CreatePayload>(item);
    } else {
      data = item;
    }
    return this.http
      .post<BaseDataModel<unknown>>(url, data, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => this.parseDetail(dataObject.data)));
  }

  delete(params: DeleteParams, queryParams?: QueryParams): Observable<void | EntityDetailModel> {
    return this.http
      .delete<BaseDataModel<unknown> | null>(this.deleteUrl(params), {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => (dataObject == null ? undefined : this.parseDetail(dataObject.data))));
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
  CreatePayload extends DataObject = Partial<EntityDetailModel>,
> extends AbstractApiServiceDetail<
  EntityDetailModel,
  GetParams,
  CreateParams,
  PutParams,
  PatchParams,
  DeleteParams,
  CreatePayload
> {
  protected summarySchema?: z.ZodType<EntityListModel>;

  protected parseSummaryList(data: unknown): EntityListModel[] {
    return this.summarySchema ? parseWithDebug(z.array(this.summarySchema), data) : (data as EntityListModel[]);
  }

  protected listUrl(params?: ListParams): string {
    return `${this.getBaseUrl(params)}`;
  }

  list(params?: ListParams, queryParams?: QueryParams): Observable<EntityListModel[]> {
    const url = params ? this.listUrl(params) : this.listUrl();
    return this.http
      .get<BaseDataModel<unknown>>(url, {
        params: queryParams ? makeOptions(queryParams) : {},
      })
      .pipe(map((dataObject) => this.parseSummaryList(dataObject.data)));
  }
}

export function makeFormData<T extends DataObject>(item: T): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(item)) {
    if (value === undefined || value === null) {
      // Ignore null/undefined values
    } else if (value instanceof File || value instanceof Blob) {
      // Handle files
      formData.append(key, value);
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
