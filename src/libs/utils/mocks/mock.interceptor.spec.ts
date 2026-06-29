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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { lastValueFrom, of } from "rxjs";
import { TestBed } from "@angular/core/testing";
import { mockInterceptor } from "./mock.interceptor";
import { MOCK_DOMAINS } from "./mock-handlers";
import { DomainMockStore } from "./mock-state";
import { MockDomain } from "./mock.types";

const ORIGINAL_DOMAINS = [...MOCK_DOMAINS];
function setDomains(...domains: MockDomain[]): void {
  MOCK_DOMAINS.length = 0;
  MOCK_DOMAINS.push(...domains);
}

describe("mockInterceptor", () => {
  const feedRequest = new HttpRequest("GET", "https://api.test/v1/api/feeds");
  const respondFromNext: HttpHandlerFn = () => of(new HttpResponse({ body: "from-next" }));
  let store: InstanceType<typeof DomainMockStore>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  function intercept(next: HttpHandlerFn) {
    return TestBed.runInInjectionContext(() => mockInterceptor(feedRequest, next));
  }

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(DomainMockStore);
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setDomains(...ORIGINAL_DOMAINS);
  });

  it("mocked domain + a matching handler → mocked response", async () => {
    localStorage.setItem("tenzu.debug", "1"); // force the debug log
    const matchingHandler = vi.fn(() => of(new HttpResponse({ status: 200, body: { mocked: true } })));
    setDomains({ name: "feed", handlers: [matchingHandler] });
    store.enableDomainMock("feed", true);
    const next = vi.fn(respondFromNext);

    const response = await lastValueFrom(intercept(next));

    expect((response as HttpResponse<unknown>).body).toEqual({ mocked: true });
    expect(next).not.toHaveBeenCalled();
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining("[MOCK] mocked[feed]"), "");
  });

  it("non-mocked domain → passthrough", async () => {
    const feedHandler = vi.fn(() => of(new HttpResponse({ body: { mocked: true } })));
    setDomains({ name: "feed", handlers: [feedHandler] });

    const next = vi.fn(respondFromNext);

    const response = await lastValueFrom(intercept(next));

    expect(next).toHaveBeenCalledOnce();
    expect((response as HttpResponse<unknown>).body).toBe("from-next");
    expect(feedHandler).not.toHaveBeenCalled();
  });

  it("no handler matches → passthrough", async () => {
    const nullHandler = vi.fn(() => null);
    setDomains({ name: "feed", handlers: [nullHandler] });
    store.enableDomainMock("feed", true);
    const next = vi.fn(respondFromNext);

    const response = await lastValueFrom(intercept(next));

    expect(next).toHaveBeenCalledOnce();
    expect((response as HttpResponse<unknown>).body).toBe("from-next");
  });

  it("first matching handler wins", async () => {
    const firstHandler = vi.fn(() => of(new HttpResponse({ body: "first" })));
    const secondHandler = vi.fn(() => of(new HttpResponse({ body: "second" })));
    setDomains({ name: "feed", handlers: [firstHandler, secondHandler] });
    store.enableDomainMock("feed", true);
    const next = vi.fn(respondFromNext);

    const response = await lastValueFrom(intercept(next));

    expect((response as HttpResponse<unknown>).body).toBe("first");
    expect(secondHandler).not.toHaveBeenCalled();
  });
});
