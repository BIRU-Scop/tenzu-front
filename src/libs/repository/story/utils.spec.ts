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

import { beforeEach, describe, expect, it } from "vitest";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { getAssignees } from "./utils";
import { makeUserNested } from "@tenzu/utils/testing/factories";

describe("getAssignees", () => {
  const userA = makeUserNested({ id: "user-a", fullName: "Alice" });
  const userB = makeUserNested({ id: "user-b", fullName: "Bob" });

  beforeEach(() => {
    const memberMap = signal({ "user-a": userA, "user-b": userB });
    TestBed.configureTestingModule({
      providers: [{ provide: ProjectMembershipRepositoryService, useValue: { memberMap } }],
    });
  });

  it("maps assignee ids to their member", () => {
    const story = signal({ assigneeIds: ["user-a", "ghost", "user-b"] });

    const assignees = TestBed.runInInjectionContext(() => getAssignees(story));

    expect(assignees()).toEqual([userA, userB]);
  });

  it("returns an empty array when the story has no assignees", () => {
    const story = signal({ assigneeIds: [] });

    const assignees = TestBed.runInInjectionContext(() => getAssignees(story));

    expect(assignees()).toEqual([]);
  });

  it("reacts to story changes", () => {
    const story = signal<{ assigneeIds: string[] }>({ assigneeIds: ["user-a"] });

    const assignees = TestBed.runInInjectionContext(() => getAssignees(story));
    expect(assignees()).toEqual([userA]);

    story.set({ assigneeIds: ["user-a", "user-b"] });
    expect(assignees()).toEqual([userA, userB]);
  });
});
