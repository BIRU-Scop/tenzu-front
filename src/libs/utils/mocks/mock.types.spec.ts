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

import { describe, expect, it, vi } from "vitest";
import { HttpErrorResponse, HttpRequest, HttpResponse } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { defineMock } from "./mock.types";

describe("defineMock", () => {
  it("match method + URL suffix", async () => {
    const respond = vi.fn(() => ({ data: [] }));
    const handler = defineMock({ method: "GET", urlMatch: "/feeds", respond });
    const req = new HttpRequest("GET", "https://api.test/v1/api/feeds");

    const response = await lastValueFrom(handler(req)!);

    expect(response).toBeInstanceOf(HttpResponse);
    expect((response as HttpResponse<unknown>).status).toBe(200);
    expect((response as HttpResponse<{ data: unknown }>).body).toEqual({ data: [] });
    expect(respond).toHaveBeenCalledWith(req, {});
  });

  it("method that does not match → null", () => {
    const handler = defineMock({ method: "GET", urlMatch: "/feeds", respond: () => ({ data: [] }) });

    const result = handler(new HttpRequest("POST", "https://api.test/v1/api/feeds", {}));

    expect(result).toBeNull();
  });

  it("URL that does not match → null", () => {
    const handler = defineMock({ method: "GET", urlMatch: "/feeds", respond: () => ({ data: [] }) });

    const result = handler(new HttpRequest("GET", "https://api.test/v1/api/stories"));

    expect(result).toBeNull();
  });

  it("a near-miss on endsWith does not match", () => {
    const handler = defineMock({ method: "GET", urlMatch: "/feeds", respond: () => ({ data: [] }) });

    const result = handler(new HttpRequest("GET", "https://api.test/v1/api/special-feeds"));

    expect(result).toBeNull();
  });

  it("urlMatch provided as predicate", async () => {
    const respond = vi.fn(() => ({ data: [] }));
    const handler = defineMock({ method: "GET", urlMatch: (url) => url.includes("/feeds"), respond });

    const matchingRequest = new HttpRequest("GET", "https://api.test/v1/api/feeds");
    const response = await lastValueFrom(handler(matchingRequest)!);

    expect((response as HttpResponse<unknown>).status).toBe(200);
    expect(respond).toHaveBeenCalledWith(matchingRequest, {});
    expect(handler(new HttpRequest("GET", "https://api.test/v1/api/stories"))).toBeNull();
  });

  it("pattern :param matches and captures segments", async () => {
    const handler = defineMock({
      method: "GET",
      urlMatch: "/projects/:projectId/stories/:ref",
      respond: (_req, params) => params,
    });

    const response = await lastValueFrom(
      handler(new HttpRequest("GET", "https://api.test/v1/api/projects/p-1/stories/3"))!,
    );

    expect((response as HttpResponse<unknown>).body).toEqual({ projectId: "p-1", ref: "3" });
  });

  it("pattern does not match a sub-resource", () => {
    const handler = defineMock({
      method: "GET",
      urlMatch: "/projects/:projectId/stories/:ref",
      respond: () => ({}),
    });

    const result = handler(new HttpRequest("GET", "https://api.test/v1/api/projects/p-1/stories/3/assignments"));

    expect(result).toBeNull();
  });

  it("pattern :param ignores the query string", async () => {
    const handler = defineMock({ method: "GET", urlMatch: "/stories/:ref", respond: (_req, params) => params });

    const response = await lastValueFrom(
      handler(new HttpRequest("GET", "https://api.test/v1/api/stories/3?expand=tasks"))!,
    );

    expect((response as HttpResponse<unknown>).body).toEqual({ ref: "3" });
  });

  it("status >= 400 → error flux", async () => {
    const handler = defineMock({ method: "GET", urlMatch: "/feeds", status: 500, respond: () => ({ detail: "boom" }) });

    const error = await lastValueFrom(handler(new HttpRequest("GET", "https://api.test/v1/api/feeds"))!).catch(
      (caught) => caught,
    );

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect(error.status).toBe(500);
    expect(error.error).toEqual({ detail: "boom" });
  });
});
