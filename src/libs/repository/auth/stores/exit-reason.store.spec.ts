/*
 * Copyright (C) 2025-2026 BIRU
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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";

import { ExitReasonStore } from "./exit-reason.store";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("ExitReasonStore", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [testingProviders] });
  });

  it("remember sets exit to the reason and fromChannel given", () => {
    const store = TestBed.inject(ExitReasonStore);

    store.remember("refreshExpired", true);

    expect(store.exit()).toEqual({ reason: "refreshExpired", fromChannel: true });
  });

  it("clear sets exit to null", () => {
    const store = TestBed.inject(ExitReasonStore);
    store.remember("refreshExpired", false);

    store.clear();

    expect(store.exit()).toBeNull();
  });

  it("ExitReasonStore starts with exit null", () => {
    expect(TestBed.inject(ExitReasonStore).exit()).toBeNull();
  });
});
