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
import {
  getProjectLandingPageUrl,
  getProjectMembersRootUrl,
  getProjectRootUrl,
  getStoryDetailUrl,
  getWorkflowRootUrl,
  getWorkflowUrl,
  getWorkspaceMembersRootUrl,
  getWorkspaceRootUrl,
  HOMEPAGE_URL,
  usableNext,
} from "./urls";

const project = { id: "p1", workspaceId: "w1", landingPage: "kanban" };
const workspace = { id: "w1" };

describe("url helpers", () => {
  it("builds the project root url", () => {
    expect(getProjectRootUrl(project)).toBe("/workspace/w1/project/p1");
  });

  it("builds the project landing page url", () => {
    expect(getProjectLandingPageUrl(project)).toBe("/workspace/w1/project/p1/kanban");
  });

  it("builds the project members url", () => {
    expect(getProjectMembersRootUrl(project)).toBe("/workspace/w1/project/p1/members");
  });

  it("builds the workflow root and slug urls", () => {
    expect(getWorkflowRootUrl(project)).toBe("/workspace/w1/project/p1/kanban");
    expect(getWorkflowUrl(project, "main")).toBe("/workspace/w1/project/p1/kanban/main");
  });

  it("builds the story detail url", () => {
    expect(getStoryDetailUrl(project, 42)).toBe("/workspace/w1/project/p1/story/42");
  });

  it("builds workspace urls", () => {
    expect(getWorkspaceRootUrl(workspace)).toBe("/workspace/w1");
    expect(getWorkspaceMembersRootUrl(workspace)).toBe("/workspace/w1/members");
  });

  describe("usableNext", () => {
    it("keeps an in-app url", () => {
      expect(usableNext("/workspace/w1/project/p1")).toBe("/workspace/w1/project/p1");
    });

    it("drops the homepage, which is where an empty next already lands", () => {
      expect(usableNext(HOMEPAGE_URL)).toBeNull();
    });

    it("drops auth routes", () => {
      expect(usableNext("")).toBeNull();
      expect(usableNext("/login")).toBeNull();
      expect(usableNext("/login?next=/workspace")).toBeNull();
      expect(usableNext("/signup")).toBeNull();
      expect(usableNext("/reset-password/token-1")).toBeNull();
      expect(usableNext("/accept-project-invitation/token-1")).toBeNull();
    });

    it("drops anything that could leave the origin", () => {
      expect(usableNext("//bad.site.com")).toBeNull();
      expect(usableNext("/\\bad.site.com")).toBeNull();
      expect(usableNext("https://bad.site.com")).toBeNull();
      expect(usableNext("  //bad.site.com")).toBeNull();
    });
  });
});
