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

import { WorkspaceInvitationsApiService } from "./workspace-invitation-api-service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { makePublicWorkspacePendingInvitation, makeWorkspaceInvitation } from "./workspace-invitation.factories";
import { makeCreateInvitations } from "@tenzu/repository/membership/membership.factories";

describe(WorkspaceInvitationsApiService.name, () => {
  let service: WorkspaceInvitationsApiService;
  let httpMock: HttpTestingController;
  let BASE: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
    service = TestBed.inject(WorkspaceInvitationsApiService);
    httpMock = TestBed.inject(HttpTestingController);
    BASE = TestBed.inject(ConfigAppService).apiUrl();
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it("list parses conforming payload", async () => {
    const invitation = makeWorkspaceInvitation();
    const promise = lastValueFrom(service.list({ workspaceId: "workspace-1" }));

    httpMock.expectOne(`${BASE}/workspaces/workspace-1/invitations`).flush({ data: [invitation] });

    expect(await promise).toEqual([invitation]);
  });

  it("list throws on a non-conforming payload", async () => {
    const raw = { ...makeWorkspaceInvitation(), numEmailsSent: "many" };
    const promise = lastValueFrom(service.list({ workspaceId: "workspace-1" }));

    httpMock.expectOne(`${BASE}/workspaces/workspace-1/invitations`).flush({ data: [raw] });

    await expect(promise).rejects.toThrow();
  });

  it("getByToken parses the public pending invitation", async () => {
    const publicInvitation = makePublicWorkspacePendingInvitation();
    const promise = lastValueFrom(service.getByToken({ token: "tok-1" }));

    httpMock.expectOne(`${BASE}/workspaces/invitations/by_token/tok-1`).flush({ data: publicInvitation });

    expect(await promise).toEqual(publicInvitation);
  });

  it("createBulkInvitations parses the CreateInvitations response", async () => {
    const result = makeCreateInvitations();
    const promise = lastValueFrom(
      service.createBulkInvitations(
        { invitations: [{ email: "a@b.c", roleId: "role-1" }] },
        { workspaceId: "workspace-1" },
      ),
    );

    httpMock.expectOne(`${BASE}/workspaces/workspace-1/invitations`).flush(result);

    expect(await promise).toEqual(result);
  });
});
