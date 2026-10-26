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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";

import { NEXT_KEY, RememberedNextStore } from "./remembered-next.store";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("RememberedNextStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [testingProviders] });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("remember writes next and username under NEXT_KEY of sessionStorage", () => {
    TestBed.inject(RememberedNextStore).remember("/workspace/w1/project/p1", "alice");

    expect(JSON.parse(sessionStorage.getItem(NEXT_KEY) ?? "null")).toEqual({
      next: "/workspace/w1/project/p1",
      username: "alice",
    });
  });

  it("take returns next when the username is the one given to remember", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("/workspace/w1/project/p1", "alice");

    expect(store.take("alice")).toBe("/workspace/w1/project/p1");
  });

  it("take returns null when the username differs from the one given to remember", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("/workspace/w1/project/p1", "alice");

    expect(store.take("bob")).toBeNull();
  });

  it("take returns next for any username when remember was given a null username", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("/workspace/w1/project/p1", null);

    expect(store.take("bob")).toBe("/workspace/w1/project/p1");
  });

  it("take removes NEXT_KEY of sessionStorage whatever the username", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("/workspace/w1/project/p1", "alice");

    store.take("bob");

    expect(sessionStorage.getItem(NEXT_KEY)).toBeNull();
  });

  it("take returns null after a previous take", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("/workspace/w1", "alice");
    store.take("alice");

    expect(store.take("alice")).toBeNull();
  });

  it("take returns null when the remembered next is not usable", () => {
    const store = TestBed.inject(RememberedNextStore);
    store.remember("//evil.example", "alice");

    expect(store.take("alice")).toBeNull();
  });

  it("a store created while sessionStorage holds a next starts with it", () => {
    sessionStorage.setItem(NEXT_KEY, JSON.stringify({ next: "/workspace/w1", username: "alice" }));

    expect(TestBed.inject(RememberedNextStore).take("alice")).toBe("/workspace/w1");
  });
});
