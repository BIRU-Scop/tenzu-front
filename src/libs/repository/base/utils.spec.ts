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

import { describe, expect, it } from "vitest";

import { prependIdIfAbsent, removeId } from "./utils";

describe("prependIdIfAbsent", () => {
  it("prepends a missing id", () => {
    expect(prependIdIfAbsent(["b", "c"], "a")).toEqual(["a", "b", "c"]);
  });

  it("returns the same reference when the id is already present", () => {
    const ids = ["a", "b"];

    // Identity is the no-op contract: store guards use `!==` to skip updates.
    expect(prependIdIfAbsent(ids, "a")).toBe(ids);
  });
});

describe("removeId", () => {
  it("removes the given id", () => {
    expect(removeId(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("returns the same reference when the id is absent", () => {
    const ids = ["a", "b"];

    // Same no-op contract as prependIdIfAbsent; without it, the identity
    // guards of removeTagFromStories patch every story of the board.
    expect(removeId(ids, "x")).toBe(ids);
  });
});
