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
import { HttpRequest, HttpResponse } from "@angular/common/http";
import { lastValueFrom, of } from "rxjs";
import { feedMockInterceptor, MOCK_FEED_ITEMS } from "./feed-mock.interceptor";

const NEXT_RESULT = new HttpResponse({ status: 204 });

describe("feedMockInterceptor", () => {
  it("returns the dummy dataset for GET /feeds", async () => {
    const next = vi.fn(() => of(NEXT_RESULT));
    const req = new HttpRequest("GET", "https://api.test/v1/api/feeds");

    const response = await lastValueFrom(feedMockInterceptor(req, next));

    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(HttpResponse);
    expect((response as HttpResponse<{ data: unknown }>).body).toEqual({ data: MOCK_FEED_ITEMS });
  });
});
