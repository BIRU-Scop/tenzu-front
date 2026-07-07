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
import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { lastValueFrom } from "rxjs";

import { WorkflowApiService } from "./workflow-api.service";
import { ConfigAppService } from "../config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makeWorkflow } from "./workflow.factories";

describe(WorkflowApiService.name, () => {
  let service: WorkflowApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(WorkflowApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("get parses conforming payload", async () => {
    const workflow = makeWorkflow();
    const promise = lastValueFrom(service.get({ workflowId: "wf-1" }));

    httpMock.expectOne(`${BASE}/workflows/wf-1`).flush({ data: workflow });

    expect(await promise).toEqual(workflow);
  });

  it("get throws on a non-conforming payload", async () => {
    const raw = { ...makeWorkflow(), order: "first" };
    const promise = lastValueFrom(service.get({ workflowId: "wf-1" }));

    httpMock.expectOne(`${BASE}/workflows/wf-1`).flush({ data: raw });

    await expect(promise).rejects.toThrow();
  });

  it("getBySlug parses the payload", async () => {
    const workflow = makeWorkflow({ slug: "my-workflow", projectId: "p-1" });
    const promise = lastValueFrom(service.getBySlug({ projectId: "p-1", workflowSlug: "my-workflow" }));

    httpMock.expectOne(`${BASE}/projects/p-1/workflows/by_slug/my-workflow`).flush({ data: workflow });

    expect(await promise).toEqual(workflow);
  });
});
