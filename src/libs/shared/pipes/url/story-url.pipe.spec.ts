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
import { StoryUrlPipe } from "./story-url.pipe";
import { makeProjectLinkNested, makeStoryNested } from "@tenzu/utils/testing/factories";

describe("StoryUrlPipe", () => {
  const pipe = new StoryUrlPipe();

  it("builds the story detail url from project and story", () => {
    const project = makeProjectLinkNested({ id: "p1", workspaceId: "w1" });
    const story = makeStoryNested({ ref: 42 });
    expect(pipe.transform({ project, story })).toBe("/workspace/w1/project/p1/story/42");
  });
});
