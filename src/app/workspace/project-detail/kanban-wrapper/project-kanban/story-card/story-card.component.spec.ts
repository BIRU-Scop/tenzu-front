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
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StoryCardComponent } from "./story-card.component";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { makeStorySummary } from "@tenzu/repository/story/story.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(StoryCardComponent.name, () => {
  let fixture: ComponentFixture<StoryCardComponent>;
  let tagsStore: InstanceType<typeof StoryTagEntitiesSummaryStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryCardComponent],
      providers: [testingProviders],
    }).compileComponents();

    tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
    fixture = TestBed.createComponent(StoryCardComponent);
  });

  it("displays the tag chips read-only", () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3 }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature", color: 5 }),
    ]);
    fixture.componentRef.setInput("story", makeStorySummary({ ref: 1, tagIds: ["tag-1", "tag-2"] }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll("app-story-tag-chip")).toHaveLength(2);
    expect(element.querySelector("button.mat-mdc-chip-remove")).toBeNull();
    expect(element.querySelector("mat-chip-row")).toBeNull();
  });

  const SHORT = "a";
  const LONG = "x".repeat(80);

  const renderTags = (labels: string[]): string[] => {
    tagsStore.setAllEntities(
      labels.map((label, index) => makeStoryTagWithCount({ id: `tag-${index + 1}`, label, color: index + 1 })),
    );
    fixture.componentRef.setInput(
      "story",
      makeStorySummary({ ref: 1, tagIds: labels.map((_, index) => `tag-${index + 1}`) }),
    );
    const element = fixture.nativeElement as HTMLElement;
    element.style.cssText = "display: block; width: 240px";
    fixture.detectChanges();

    const chipsRectSize = (
      element.querySelector(".mdc-evolution-chip-set__chips") as HTMLElement
    ).getBoundingClientRect();
    return Array.from(element.querySelectorAll("app-story-tag-chip")).map((host) => {
      const label = host.querySelector(".mdc-evolution-chip__text-label") as HTMLElement;
      if (label.scrollWidth <= label.clientWidth) {
        return "fits";
      }
      const end = ((host.getBoundingClientRect().right - chipsRectSize.left) / chipsRectSize.width) * 100;
      return `truncated at ${Math.round(end)}%`;
    });
  };

  it.each([
    { labels: [LONG], tags: ["truncated at 100%"] },
    { labels: [LONG, LONG], tags: ["truncated at 50%", "truncated at 100%"] },
    { labels: [SHORT, LONG], tags: ["fits", "truncated at 100%"] },
    { labels: [LONG, LONG, LONG], tags: ["truncated at 33%", "truncated at 67%", "truncated at 100%"] },
    { labels: [SHORT, LONG, LONG], tags: ["fits", "truncated at 67%", "truncated at 100%"] },
    { labels: [LONG, SHORT, LONG], tags: ["truncated at 33%", "fits", "truncated at 100%"] },
  ])("renders the tags $tags", ({ labels, tags }) => {
    expect(renderTags(labels)).toEqual(tags);
  });

  it("renders overflow as an accessible +N badge", () => {
    tagsStore.setAllEntities(
      Array.from({ length: 6 }, (_, index) =>
        makeStoryTagWithCount({ id: `tag-${index + 1}`, label: `label-${index + 1}`, color: (index % 8) + 1 }),
      ),
    );
    fixture.componentRef.setInput(
      "story",
      makeStorySummary({ ref: 1, tagIds: Array.from({ length: 6 }, (_, index) => `tag-${index + 1}`) }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll("app-story-tag-chip")).toHaveLength(3);
    const badge = Array.from(element.querySelectorAll("[aria-label]")).find((candidate) =>
      candidate.textContent?.includes("+3"),
    );
    expect(badge).toBeDefined();
    expect(badge?.getAttribute("aria-label")).toContain("label-4");
    expect(badge?.getAttribute("aria-label")).toContain("label-6");
  });
});
