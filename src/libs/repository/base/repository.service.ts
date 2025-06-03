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

import { EntityId, EntityMap, SelectEntityId } from "@ngrx/signals/entities";
import { AbstractApiService, AbstractApiServiceDetail } from "./abstract-api-services";
import { getEntityIdSelector, withEntityDetailStore, withEntityListFeature } from "./features";
import { signalStore } from "@ngrx/signals";
import { QueryParams } from "./utils";
import { lastValueFrom } from "rxjs";
import { Signal } from "@angular/core";
import { NotFoundEntityError } from "./errors";
import { JsonObject } from "./misc.model";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function storeWithEntityListFeature<EntitySummary extends JsonObject>() {
  return signalStore({ providedIn: "root" }, withEntityListFeature<EntitySummary>());
}
type StoreWithEntityListFeature<EntitySummary extends JsonObject> = InstanceType<
  ReturnType<typeof storeWithEntityListFeature<EntitySummary>>
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function storeWithEntityDetailStore<EntityDetail extends JsonObject>() {
  return signalStore({ providedIn: "root" }, withEntityDetailStore<EntityDetail>());
}
type StoreWithEntityDetailStore<EntityDetail extends JsonObject> = InstanceType<
  ReturnType<typeof storeWithEntityDetailStore<EntityDetail>>
>;

export interface ServiceEntitySummaryList<EntitySummary extends JsonObject, ListParams> {
  entitiesSummary: Signal<EntitySummary[]>;
  entityMapSummary: Signal<EntityMap<EntitySummary>>;
  setAllEntitiesSummary(items: EntitySummary[]): void;
  setMultipleEntitiesSummary(items: EntitySummary[]): void;
  setEntitySummary(item: EntitySummary): void;
  addMultipleEntitiesSummary(items: EntitySummary[]): void;
  addEntitySummary(item: EntitySummary): void;
  prependMultipleEntitiesSummary(items: EntitySummary[]): void;
  prependEntitySummary(item: EntitySummary): void;
  upsertMultipleEntitiesSummary(items: EntitySummary[]): void;
  upsertEntitySummary(item: EntitySummary): void;
  updateEntitySummary(id: EntityId, partialItem: Partial<EntitySummary>): EntitySummary;
  deleteEntitySummary(id: EntityId): void;
  resetEntitySummaryList(): void;
  listRequest(params?: ListParams, queryParams?: QueryParams): Promise<EntitySummary[]>;
  resetAll(): void;
}

export interface ServiceEntityDetail<
  EntityDetailModel extends JsonObject,
  GetParams extends Record<string, EntityId> | unknown = { id: EntityId },
  CreateParams extends Record<string, EntityId> | unknown | undefined = undefined,
  PutParams extends Record<string, EntityId> | unknown = GetParams,
  PatchParams extends Record<string, EntityId> | unknown = GetParams,
  DeleteParams extends Record<string, EntityId> | unknown = GetParams,
> {
  setEntityDetail(item: EntityDetailModel): void;
  updateEntityDetail(id: EntityDetailModel): EntityDetailModel;
  deleteEntityDetail(item: EntityDetailModel): void;
  resetEntityDetail(): void;

  getRequest(params: GetParams, queryParams?: QueryParams): Promise<EntityDetailModel>;
  patchRequest(
    itemId: EntityId,
    partialData: Partial<EntityDetailModel>,
    params: PatchParams,
    queryParams?: QueryParams,
  ): Promise<EntityDetailModel>;
  putRequest(item: EntityDetailModel, params: PutParams, queryParams?: QueryParams): Promise<EntityDetailModel>;
  createRequest(item: Partial<EntityDetailModel>, params?: CreateParams): Promise<EntityDetailModel>;
  deleteRequest(item: EntityDetailModel, params: DeleteParams, queryParams?: QueryParams): Promise<EntityDetailModel>;
}

export abstract class BaseRepositoryDetailService<
  EntityDetail extends JsonObject,
  GetParams extends Record<string, EntityId> | unknown = undefined,
  CreateParams extends Record<string, EntityId> | unknown | undefined = undefined,
  PutParams extends Record<string, EntityId> | unknown = GetParams,
  PatchParams extends Record<string, EntityId> | unknown = GetParams,
  DeleteParams extends Record<string, EntityId> | unknown = GetParams,
> implements ServiceEntityDetail<EntityDetail, GetParams, CreateParams, PutParams, PatchParams, DeleteParams>
{
  protected abstract apiService: AbstractApiServiceDetail<
    EntityDetail,
    GetParams,
    CreateParams,
    PutParams,
    PatchParams,
    DeleteParams
  >;
  protected selectIdFn: SelectEntityId<NoInfer<EntityDetail>> | undefined = undefined;
  protected abstract entityDetailStore: StoreWithEntityDetailStore<EntityDetail>;
  protected getEntityIdFn = getEntityIdSelector({ selectId: this.selectIdFn });

  get entityDetail(): Signal<EntityDetail | undefined> {
    return this.entityDetailStore.item;
  }
  async getRequest(params: GetParams, queryParams?: QueryParams): Promise<EntityDetail> {
    const item = await lastValueFrom(this.apiService.get(params, queryParams));
    this.setEntityDetail(item);
    return item;
  }
  async patchRequest(
    itemId: EntityId,
    partialData: Partial<EntityDetail>,
    params: PatchParams,
    queryParams?: QueryParams,
  ): Promise<EntityDetail> {
    if (itemId === this.getEntityIdFn(this.entityDetail())) {
      const entity = await lastValueFrom(this.apiService.patch(partialData, params, queryParams));
      return this.updateEntityDetail(entity);
    }
    throw new NotFoundEntityError(`Entity ${itemId} not found`);
  }
  async putRequest(item: EntityDetail, params: PutParams, queryParams?: QueryParams): Promise<EntityDetail> {
    if (this.getEntityIdFn(item) === this.getEntityIdFn(this.entityDetail())) {
      const entity = await lastValueFrom(this.apiService.put(item, params, queryParams));
      return this.updateEntityDetail(entity);
    }
    throw new NotFoundEntityError(`Entity ${this.getEntityIdFn(item)} not found`, item);
  }
  async createRequest(item: Partial<EntityDetail>, params?: CreateParams): Promise<EntityDetail> {
    const entity = await lastValueFrom(this.apiService.create(item, params));
    this.setEntityDetail(entity);
    return entity;
  }
  async deleteRequest(item: EntityDetail, params: DeleteParams, queryParams?: QueryParams): Promise<EntityDetail> {
    const result = this.deleteEntityDetail(item);
    await lastValueFrom(this.apiService.delete(params, queryParams));
    return result;
  }

  setEntityDetail(item: EntityDetail): void {
    this.entityDetailStore.set(item);
  }
  updateEntityDetail(item: EntityDetail): EntityDetail {
    return this.entityDetailStore.update(this.getEntityIdFn(item), item);
  }
  deleteEntityDetail(item: EntityDetail): EntityDetail {
    return this.entityDetailStore.delete(this.getEntityIdFn(item));
  }
  resetEntityDetail(): void {
    this.entityDetailStore.reset();
  }
}

export abstract class BaseRepositoryService<
    EntitySummary extends JsonObject,
    EntityDetail extends EntitySummary = EntitySummary,
    ListParams extends Record<string, EntityId> | undefined = undefined,
    GetParams extends Record<string, EntityId> | unknown = { id: EntityId },
    CreateParams extends Record<string, EntityId> | undefined = undefined,
    PutParams extends Record<string, EntityId> | unknown = GetParams,
    PatchParams extends Record<string, EntityId> | unknown = GetParams,
    DeleteParams extends Record<string, EntityId> | unknown = GetParams,
  >
  extends BaseRepositoryDetailService<EntityDetail, GetParams, CreateParams, PutParams, PatchParams, DeleteParams>
  implements ServiceEntitySummaryList<EntitySummary, ListParams>
{
  protected abstract entitiesSummaryStore: StoreWithEntityListFeature<EntitySummary>;
  protected abstract override apiService: AbstractApiService<
    EntitySummary,
    EntityDetail,
    ListParams,
    GetParams,
    CreateParams,
    PutParams,
    PatchParams,
    DeleteParams
  >;

  get entitiesSummary(): Signal<EntitySummary[]> {
    return this.entitiesSummaryStore.entities;
  }
  get entityMapSummary(): Signal<EntityMap<EntitySummary>> {
    return this.entitiesSummaryStore.entityMap;
  }
  override async createRequest(
    item: Partial<EntityDetail>,
    params?: CreateParams,
    options: { prepend: boolean } = { prepend: false },
  ): Promise<EntityDetail> {
    const entity = await lastValueFrom(this.apiService.create(item, params));
    this.setEntityDetail(entity, options);
    return entity;
  }

  setAllEntitiesSummary(items: EntitySummary[]): void {
    this.entitiesSummaryStore.setAllEntities(items);
  }
  setMultipleEntitiesSummary(items: EntitySummary[]): void {
    this.entitiesSummaryStore.setEntities(items);
  }
  setEntitySummary(item: EntitySummary): void {
    this.entitiesSummaryStore.setEntity(item);
  }
  addMultipleEntitiesSummary(items: EntitySummary[]) {
    this.entitiesSummaryStore.addEntities(items);
  }
  addEntitySummary(item: EntitySummary): void {
    this.entitiesSummaryStore.addEntity(item);
  }
  prependMultipleEntitiesSummary(items: EntitySummary[]) {
    this.entitiesSummaryStore.prependEntities(items);
  }
  prependEntitySummary(item: EntitySummary): void {
    this.entitiesSummaryStore.prependEntity(item);
  }
  upsertMultipleEntitiesSummary(items: EntitySummary[]) {
    this.entitiesSummaryStore.upsertEntities(items);
  }
  upsertEntitySummary(item: EntitySummary): void {
    this.entitiesSummaryStore.upsertEntity(item);
  }

  updateEntitySummary(id: EntityId, partialItem: Partial<EntitySummary>): EntitySummary {
    return this.entitiesSummaryStore.updateEntity(id, partialItem);
  }
  deleteEntitySummary(id: EntityId): void {
    this.entitiesSummaryStore.deleteEntity(id);
  }
  resetEntitySummaryList(): void {
    this.entitiesSummaryStore.reset();
  }
  async listRequest(params?: ListParams | undefined, queryParams?: QueryParams): Promise<EntitySummary[]> {
    const entities = await lastValueFrom(this.apiService.list(params, queryParams));
    this.setAllEntitiesSummary(entities);
    return entities;
  }

  override setEntityDetail(item: EntityDetail, options: { prepend: boolean } = { prepend: false }): void {
    if (options.prepend && !this.entityMapSummary()[this.getEntityIdFn(item)]) {
      this.prependEntitySummary(item);
    } else {
      this.upsertEntitySummary(item);
    }
    super.setEntityDetail(item);
  }
  override updateEntityDetail(item: EntityDetail): EntityDetail {
    this.upsertEntitySummary(item);
    return super.updateEntityDetail(item);
  }
  override deleteEntityDetail(item: EntityDetail): EntityDetail {
    try {
      this.deleteEntitySummary(this.getEntityIdFn(item));
    } catch (e) {
      if (!(e instanceof NotFoundEntityError)) {
        throw e;
      }
    }
    return super.deleteEntityDetail(item);
  }

  resetAll(): void {
    this.resetEntitySummaryList();
    this.resetEntityDetail();
  }
}
