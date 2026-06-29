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

/**
 * The API service is a thin layer over HttpClient, so we deliberately keep this
 * spec lean: we only assert the bits that carry actual *logic* and that a refactor
 * could silently break —
 *   - the URL shape of each distinct / custom endpoint (the contract components rely on),
 *   - the request body when the service reshapes it (e.g. `{ userId }`),
 *   - the unwrapping of the `{ data }` response envelope.
 * Plain passthroughs (e.g. method === "GET") are not re-asserted: that would just
 * restate the implementation. The real back/front contract is covered by E2E.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";
import { StoryApiService } from "./story-api.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { makeStorySummary } from "@tenzu/utils/testing/factories";
import { provideConfigAppTesting, testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("StoryApiService", () => {
  let service: StoryApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [testingProviders, provideConfigAppTesting()],
    });
    service = TestBed.inject(StoryApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("lists stories", async () => {
    const stories = [makeStorySummary({ ref: 1 }), makeStorySummary({ ref: 2 })];
    const promise = lastValueFrom(service.list({ workflowId: "wf-1" }, { limit: 50, offset: 0 }));

    httpMock.expectOne((r) => r.url === `${BASE}/workflows/wf-1/stories`).flush({ data: stories });

    expect(await promise).toEqual(stories);
  });

  it("gets a story detail", async () => {
    const detail = makeStorySummary({ ref: 3 });
    const promise = lastValueFrom(service.get({ projectId: "p-1", ref: 3 }));

    httpMock.expectOne(`${BASE}/projects/p-1/stories/3`).flush({ data: detail });

    expect(await promise).toEqual(detail);
  });

  it("creates an assignee", async () => {
    const assign = { user: { id: "user-1" }, story: { ref: 4, title: "t" } };
    const promise = lastValueFrom(service.createAssignee("user-1", { projectId: "p-1", ref: 4 }));

    const req = httpMock.expectOne(`${BASE}/projects/p-1/stories/4/assignments`);
    expect(req.request.body).toEqual({ userId: "user-1" });
    req.flush({ data: assign });

    expect(await promise).toEqual(assign);
  });
});
