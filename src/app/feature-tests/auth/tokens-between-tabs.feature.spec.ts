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
import { TestBed } from "@angular/core/testing";

import { loggedInSession } from "./session-harness";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";

describe("tokens between tabs", () => {
  const rotatedTokens = makeTokens({ username: "1user" });

  it("writeTokens of the same username from another tab keeps step loggedIn", async () => {
    const { anotherTab, fixture } = await loggedInSession();

    anotherTab.writeTokens(rotatedTokens);
    await fixture.whenStable();

    expect(TestBed.inject(SessionLifecycleService).step()).toBe("loggedIn");
  });

  it("writeTokens of the same username from another tab keeps the router on /workspace/w1", async () => {
    const { anotherTab, fixture, router } = await loggedInSession();

    anotherTab.writeTokens(rotatedTokens);
    await fixture.whenStable();

    expect(router.url).toBe("/workspace/w1");
  });

  it("writeTokens of the same username from another tab sets tokenRepositoryService.tokens to the written tokens", async () => {
    const { anotherTab, fixture } = await loggedInSession();

    anotherTab.writeTokens(rotatedTokens);
    await fixture.whenStable();

    expect(TestBed.inject(TokenRepositoryService).tokens()).toEqual(rotatedTokens);
  });

  it("writeTokens of a different username from another tab sets tokenRepositoryService.tokens to the written tokens", async () => {
    const otherRotatedTokens = makeTokens({ username: "2user" });
    const { anotherTab, fixture } = await loggedInSession();

    anotherTab.writeTokens(otherRotatedTokens);
    TestBed.tick();
    await fixture.whenStable();

    expect(TestBed.inject(TokenRepositoryService).tokens()).toBeNull();
  });
});
