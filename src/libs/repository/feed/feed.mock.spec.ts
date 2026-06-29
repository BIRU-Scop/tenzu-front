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

import { describe, expect, it } from "vitest";
import { HttpRequest, HttpResponse } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { MockHandler } from "@tenzu/utils/mocks/mock.types";
import { feedMockHandlers, MOCK_FEED_ITEMS } from "./feed.mock";
import { parseFeedItems } from "./feed-item.model";

describe("feedMockHandlers", () => {
  function runFeedHandlers(request: HttpRequest<unknown>): ReturnType<MockHandler> {
    for (const handler of feedMockHandlers) {
      const response = handler(request);
      if (response) {
        return response;
      }
    }
    return null;
  }

  it("GET /feeds returns the dataset", async () => {
    const request = new HttpRequest("GET", "https://api.test/v1/api/feeds");

    const response = await lastValueFrom(runFeedHandlers(request)!);

    expect((response as HttpResponse<unknown>).body).toEqual({ data: MOCK_FEED_ITEMS });
  });

  it("POST /feeds/read returns read states", async () => {
    const request = new HttpRequest("POST", "https://api.test/v1/api/feeds/read", { ids: ["a", "b"] });

    const response = await lastValueFrom(runFeedHandlers(request)!);

    expect((response as HttpResponse<unknown>).body).toEqual({
      data: [
        { id: "a", readAt: "2026-06-08T10:00:00.000Z" },
        { id: "b", readAt: "2026-06-08T10:00:00.000Z" },
      ],
    });
  });
});

describe("MOCK_FEED_ITEMS", () => {
  it("check the conformity of the data with the Zod schema", () => {
    const parsed = parseFeedItems(MOCK_FEED_ITEMS);

    expect(parsed).toHaveLength(MOCK_FEED_ITEMS.length);
  });
});
