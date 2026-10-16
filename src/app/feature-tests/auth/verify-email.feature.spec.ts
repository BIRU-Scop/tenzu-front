/*
 * Copyright (C) 2024-2026 BIRU
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

import { sessionHarness } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { makeUser, makeVerificationInfo } from "@tenzu/repository/user/user.factories";
import { makeProjectLinkNested } from "@tenzu/repository/project/project.factories";
import { InvitationStatus } from "@tenzu/repository/membership/invitation-status.model";
import { callsTo } from "@tenzu/utils/testing/http";

describe("verify email", () => {
  const verification = makeVerificationInfo({
    auth: makeTokens({ username: "1user" }),
    projectInvitation: {
      project: makeProjectLinkNested({ id: "p1", workspaceId: "w1" }),
      status: InvitationStatus.PENDING,
    },
  });

  it("navigating to /signup/verify/t1 with a project invitation lands on /workspace/w1/project/p1", async () => {
    const { router, httpMock, apiUrl, navigatedTo } = await sessionHarness({ url: "/" });

    router.navigateByUrl("/signup/verify/t1").then();
    (await callsTo(httpMock, `${apiUrl}/users/verify`))[0].flush(verification);
    (await callsTo(httpMock, `${apiUrl}/users/me`))[0].flush({ data: makeUser({ username: "1user" }) });
    await navigatedTo("/workspace/w1/project/p1");

    expect(router.url).toBe("/workspace/w1/project/p1");
  });

  it("navigating to /signup/verify/t1 writes the tokens of the verification under TOKENS_KEY", async () => {
    const { router, httpMock, apiUrl, navigatedTo } = await sessionHarness({ url: "/" });

    router.navigateByUrl("/signup/verify/t1").then();
    (await callsTo(httpMock, `${apiUrl}/users/verify`))[0].flush(verification);
    (await callsTo(httpMock, `${apiUrl}/users/me`))[0].flush({ data: makeUser({ username: "1user" }) });
    await navigatedTo("/workspace/w1/project/p1");

    expect(JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "null")).toEqual(verification.auth);
  });
});
