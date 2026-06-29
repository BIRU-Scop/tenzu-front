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

import { HttpHandlerFn, HttpRequest, HttpResponse } from "@angular/common/http";
import { isDevMode } from "@angular/core";
import { of } from "rxjs";
import { FeedItem } from "@tenzu/repository/feed";

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: "mock-maintenance",
    type: "maintenance",
    title: "Scheduled maintenance",
    content: "We will be performing **maintenance** tonight. The app may be briefly unavailable.",
    actionTitle: "",
    actionUrl: "",
    publicationDate: "2026-06-07T20:00:00.000Z",
  },
  {
    id: "mock-release",
    type: "release",
    title: "What's new",
    content: "Discover the latest features in this release.",
    actionTitle: "See the release",
    actionUrl: "https://example.com/release",
    publicationDate: "2026-06-06T09:00:00.000Z",
  },
  {
    id: "mock-survey",
    type: "call_to_action",
    title: "Tell us what you think",
    content: "Help us improve Tenzu by answering a short survey.",
    actionTitle: "Answer the survey",
    actionUrl: "https://example.com/survey",
    publicationDate: "2026-06-05T09:00:00.000Z",
    readAt: "2026-06-05T10:00:00.000Z",
  },
];

export function feedMockInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (!isDevMode()) {
    return next(req);
  }
  if (req.url.endsWith("/feeds") && req.method === "GET") {
    return of(new HttpResponse({ status: 200, body: { data: MOCK_FEED_ITEMS } }));
  }
  if (req.url.endsWith("/feeds/read") && req.method === "POST") {
    const ids = (req.body as { ids?: string[] })?.ids ?? [];
    const readStates = ids.map((id) => ({ id, readAt: "2026-06-08T10:00:00.000Z" }));
    return of(new HttpResponse({ status: 200, body: { data: readStates } }));
  }
  return next(req);
}
