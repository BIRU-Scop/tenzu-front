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
import { DomainMockStore } from "./mock-state";

describe("DomainMockStore", () => {
  let store: InstanceType<typeof DomainMockStore>;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(DomainMockStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initial state: registry off, no global", () => {
    expect(store.global()).toBe(false);
    expect(store.anyDomainMocked()).toBe(false);
    expect(store.isDomainMocked("feed")).toBeFalsy();
    expect(store.domaineNames()).toContain("feed");
  });

  it("enableDomainMock enables a domain", () => {
    store.enableDomainMock("feed", true);

    expect(store.isDomainMocked("feed")).toBeTruthy();
    expect(store.anyDomainMocked()).toBe(true);
    expect(store.domainMock().find((domain) => domain.name === "feed")).toEqual({
      name: "feed",
      enabled: true,
      source: "domain",
    });
  });

  it("enableDomainMock ignores a domain absent from the registry", () => {
    store.enableDomainMock("stories", true);

    expect(store.domaineNames()).not.toContain("stories");
    expect(store.isDomainMocked("stories")).toBeFalsy();
  });

  it("setDomainMock rejects a malformed name", () => {
    store.enableDomainMock("__proto__", true);

    expect(store.domaineNames()).not.toContain("__proto__");
  });

  it("enableGlobal enables everything", () => {
    store.enableGlobal(true);

    expect(store.global()).toBe(true);
    expect(store.isDomainMocked("feed")).toBeTruthy();
    expect(store.anyDomainMocked()).toBe(true);
    expect(store.domainMock().find((domain) => domain.name === "feed")).toEqual({
      name: "feed",
      enabled: true,
      source: "global",
    });
  });

  it("reset turns the registry back off", () => {
    store.enableDomainMock("feed", true);
    store.enableGlobal(true);

    store.reset();

    expect(store.global()).toBe(false);
    expect(store.isDomainMocked("feed")).toBeFalsy();
    expect(store.anyDomainMocked()).toBe(false);
  });

  it("logMockState logs each domain state", () => {
    localStorage.setItem("tenzu.debug", "1");
    const consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    store.enableDomainMock("feed", true);
    store.logMockState();
    expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining("feed : mock on"), "");
  });
});
