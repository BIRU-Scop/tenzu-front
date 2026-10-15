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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { getByRole, getTextByRole, queryByRole } from "./aria-role";

@Component({
  template: `<p role="status"><span aria-hidden="true">info</span> Upload in progress</p>`,
})
class StatusHostComponent {}

describe("aria role helpers", () => {
  let element: HTMLElement;

  beforeEach(() => {
    const fixture = TestBed.createComponent(StatusHostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it("getByRole returns the element of that role", () => {
    expect(getByRole(element, "status").textContent).toBe("info Upload in progress");
  });

  it("getByRole throws when no element of that role is rendered", () => {
    expect(() => getByRole(element, "alert")).toThrow("no element with role alert rendered");
  });

  it("getTextByRole returns the text of the element of that role without its aria-hidden descendants", () => {
    expect(getTextByRole(element, "status")).toBe("Upload in progress");
  });

  it("queryByRole returns null when no element of that role is rendered", () => {
    expect(queryByRole(element, "alert")).toBeNull();
  });
});
