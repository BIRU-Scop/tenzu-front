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

import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { Service } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";
import { z } from "zod/v4";

import { AbstractApiService } from "./abstract-api-services";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

const testSummarySchema = z.object({ id: z.string(), name: z.string() });
const testDetailSchema = testSummarySchema.extend({ description: z.string() });
type TestSummary = z.infer<typeof testSummarySchema>;
type TestDetail = z.infer<typeof testDetailSchema>;

@Service()
class TestApiService extends AbstractApiService<TestSummary, TestDetail> {
  baseUrl = `${this.configAppService.apiUrl()}/tests`;
  protected override summarySchema = testSummarySchema;
  protected override detailSchema = testDetailSchema;

  protected override getEntityBaseUrl(params: { id: string }): string {
    return `${this.baseUrl}/${params.id}`;
  }
}

@Service()
class TestApiServiceWithoutSchema extends AbstractApiService<TestSummary, TestDetail> {
  baseUrl = `${this.configAppService.apiUrl()}/tests`;

  protected override getEntityBaseUrl(params: { id: string }): string {
    return `${this.baseUrl}/${params.id}`;
  }
}

describe("AbstractApiService", () => {
  let service: TestApiService;
  let serviceWithoutSchema: TestApiServiceWithoutSchema;
  let httpMock: HttpTestingController;
  let BASE: string;
  let consoleDebug: MockInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [testingProviders],
    });
    service = TestBed.inject(TestApiService);
    serviceWithoutSchema = TestBed.inject(TestApiServiceWithoutSchema);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    consoleDebug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    consoleDebug.mockRestore();
  });

  it("validates a conforming list", async () => {
    const entity: TestSummary = { id: "1", name: "Alpha" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/tests`).flush({ data: [entity] });

    expect(await promise).toEqual([entity]);
  });

  it("throws on a non-conforming list", async () => {
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/tests`).flush({ data: [{ id: "1", name: 42 }] });

    await expect(promise).rejects.toThrow();
  });

  it("validates the detail on get/create/patch/put", async () => {
    const detail: TestDetail = { id: "1", name: "Alpha", description: "desc" };
    const invalid = { id: "1", name: "Alpha" };

    const getOk = lastValueFrom(service.get({ id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: detail });
    expect(await getOk).toEqual(detail);

    const getKo = lastValueFrom(service.get({ id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: invalid });
    await expect(getKo).rejects.toThrow();

    const createOk = lastValueFrom(service.create({ name: "Alpha", description: "desc" }));
    httpMock.expectOne(`${BASE}/tests`).flush({ data: detail });
    expect(await createOk).toEqual(detail);

    const createKo = lastValueFrom(service.create({ name: "Alpha" }));
    httpMock.expectOne(`${BASE}/tests`).flush({ data: invalid });
    await expect(createKo).rejects.toThrow();

    const patchOk = lastValueFrom(service.patch({ name: "Beta" }, { id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: detail });
    expect(await patchOk).toEqual(detail);

    const patchKo = lastValueFrom(service.patch({ name: "Beta" }, { id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: invalid });
    await expect(patchKo).rejects.toThrow();

    const putOk = lastValueFrom(service.put(detail, { id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: detail });
    expect(await putOk).toEqual(detail);

    const putKo = lastValueFrom(service.put(detail, { id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: invalid });
    await expect(putKo).rejects.toThrow();
  });

  it("delete handles the optional body", async () => {
    const detail: TestDetail = { id: "1", name: "Alpha", description: "desc" };

    const empty = lastValueFrom(service.delete({ id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush(null, { status: 204, statusText: "No Content" });
    expect(await empty).toBeUndefined();

    const withBody = lastValueFrom(service.delete({ id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: detail });
    expect(await withBody).toEqual(detail);
  });

  it("passes through without a schema", async () => {
    const arbitrary = { anything: 123, nested: { ok: true } };

    const listPromise = lastValueFrom(serviceWithoutSchema.list());
    httpMock.expectOne(`${BASE}/tests`).flush({ data: [arbitrary] });
    expect(await listPromise).toEqual([arbitrary]);

    const getPromise = lastValueFrom(serviceWithoutSchema.get({ id: "1" }));
    httpMock.expectOne(`${BASE}/tests/1`).flush({ data: arbitrary });
    expect(await getPromise).toEqual(arbitrary);
  });

  it("logs the issues in debug when validation fails", async () => {
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/tests`).flush({ data: [{ id: "1", name: 42 }] });
    await expect(promise).rejects.toThrow();

    expect(consoleDebug).toHaveBeenCalled();
    const logged = JSON.stringify(consoleDebug.mock.calls);
    expect(logged).toContain("[schema]");
    expect(logged).toContain("name");
  });
});
