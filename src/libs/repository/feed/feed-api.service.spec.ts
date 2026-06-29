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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";
import { FeedApiService } from "./feed-api.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { makeFeedItem } from "@tenzu/utils/testing/factories";
import { provideConfigAppTesting, testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("FeedApiService", () => {
  let service: FeedApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [testingProviders, provideConfigAppTesting()],
    });
    service = TestBed.inject(FeedApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("list", async () => {
    const item = makeFeedItem({ id: "m1" });
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/feeds`).flush({ data: [item] });

    expect(await promise).toEqual([item]);
  });

  it("marks items as read", async () => {
    const promise = lastValueFrom(service.markRead({ ids: ["m1"] }));

    const req = httpMock.expectOne(`${BASE}/feeds/read`);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({ ids: ["m1"] });
    req.flush({ data: [{ id: "m1", readAt: "2026-01-02T00:00:00.000Z" }] });

    expect(await promise).toEqual([{ id: "m1", readAt: "2026-01-02T00:00:00.000Z" }]);
  });

  it("raises an error on a non-ISO publicationDate", async () => {
    const raw = { ...makeFeedItem({ id: "m1" }), publicationDate: "not-a-date" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/feeds`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });

  it("raises an error on an actionUrl with a forbidden protocol", async () => {
    const raw = { ...makeFeedItem({ id: "m1" }), actionUrl: "javascript:alert(1)" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/feeds`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });

  it("raises an error on a callToAction without action", async () => {
    const raw = { ...makeFeedItem({ id: "m1" }), type: "call_to_action", actionTitle: "", actionUrl: "" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/feeds`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });

  it("raises an error when only one of actionTitle/actionUrl is set", async () => {
    const raw = { ...makeFeedItem({ id: "m1" }), type: "release", actionTitle: "Read more", actionUrl: "" };
    const promise = lastValueFrom(service.list());

    httpMock.expectOne(`${BASE}/feeds`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });
});
