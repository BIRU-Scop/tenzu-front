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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loggedInSession, SessionHarness } from "./session-harness";
import { HOUR_MS, makeTokens } from "@tenzu/repository/auth/auth.factories";
import { NEXT_KEY } from "@tenzu/repository/auth/stores/remembered-next.store";
import { translation } from "@tenzu/utils/testing/translation";

describe("refresh expired", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const loggedInSessionExpiringInOneHour = (): Promise<SessionHarness> =>
    loggedInSession({ tokens: makeTokens({ username: "1user", refreshExp: new Date(Date.now() + HOUR_MS) }) });

  const oneHourLater = (): void => {
    vi.advanceTimersByTime(HOUR_MS);
  };

  it("the eviction timer navigates to /login with the refreshExpired message", async () => {
    const { navigatedTo, alertText } = await loggedInSessionExpiringInOneHour();

    oneHourLater();
    await navigatedTo("/login");

    expect(alertText()).toBe(translation("auth.login.exit_reason.refreshExpired"));
  });

  it("the eviction timer remembers /workspace/w1 as next for 1user", async () => {
    const { navigatedTo } = await loggedInSessionExpiringInOneHour();

    oneHourLater();
    await navigatedTo("/login");

    expect(JSON.parse(sessionStorage.getItem(NEXT_KEY) ?? "null")).toEqual({
      next: "/workspace/w1",
      username: "1user",
    });
  });
});
