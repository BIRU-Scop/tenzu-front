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

import { beforeEach, describe, expect, it, Mocked } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing";

import { StoryTagsComponent } from "./story-tags.component";
import { of } from "rxjs";

import { StoryApiService } from "@tenzu/repository/story/story-api.service";
import { StoryDetailStore } from "@tenzu/repository/story/story-entities.store";
import { makeStoryDetail, makeStoryNested, makeStoryTagAssign } from "@tenzu/repository/story/story.factories";
import { StoryTagApiService } from "@tenzu/repository/story-tag/story-tag-api.service";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { mockService } from "@tenzu/utils/testing/mocks";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe(StoryTagsComponent.name, () => {
  let fixture: ComponentFixture<StoryTagsComponent>;
  let tagsStore: InstanceType<typeof StoryTagEntitiesSummaryStore>;
  let storyApi: Mocked<StoryApiService>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    storyApi = mockService(StoryApiService);
    await TestBed.configureTestingModule({
      imports: [StoryTagsComponent],
      providers: [
        testingProviders,
        { provide: StoryApiService, useValue: storyApi },
        { provide: StoryTagApiService, useValue: mockService(StoryTagApiService) },
      ],
    }).compileComponents();
    tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
    fixture = TestBed.createComponent(StoryTagsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  const chipLabels = () =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll("app-story-tag-chip")).map((chip) =>
      chip.textContent?.trim(),
    );

  const optionLabels = async (autocomplete: MatAutocompleteHarness) => {
    const options = await autocomplete.getOptions();
    return Promise.all(options.map((option) => option.getText()));
  };

  it("displays the assigned tags", () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3 }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature", color: 5 }),
      makeStoryTagWithCount({ id: "tag-3", label: "urgent", color: 1 }),
    ]);
    fixture.componentRef.setInput("story", makeStoryDetail({ ref: 1, tagIds: ["tag-1", "tag-2"] }));
    fixture.detectChanges();

    expect(chipLabels()).toEqual(["bug", "feature"]);
  });

  it("only offers the unassigned tags, filtered by the typed text", async () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug" }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature" }),
      makeStoryTagWithCount({ id: "tag-3", label: "urgent" }),
    ]);
    fixture.componentRef.setInput("story", makeStoryDetail({ ref: 1, tagIds: ["tag-1"] }));
    fixture.componentRef.setInput("hasModifyPermission", true);
    fixture.detectChanges();

    const autocomplete = await loader.getHarness(MatAutocompleteHarness);

    await autocomplete.focus();
    expect(await optionLabels(autocomplete)).toEqual(["feature", "urgent"]);

    await autocomplete.enterText("urg");
    expect(await optionLabels(autocomplete)).toEqual(["urgent"]);
  });

  it("selecting a tag assigns it", async () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug" }),
      makeStoryTagWithCount({ id: "tag-3", label: "urgent" }),
    ]);
    const story = makeStoryDetail({ ref: 1, projectId: "project-1", tagIds: ["tag-1"] });
    TestBed.inject(StoryDetailStore).set(story);
    fixture.componentRef.setInput("story", story);
    fixture.componentRef.setInput("hasModifyPermission", true);
    storyApi.createTagAssignment.mockReturnValue(
      of(
        makeStoryTagAssign({
          tag: makeStoryTagWithCount({ id: "tag-3", label: "urgent" }),
          story: makeStoryNested({ ref: 1 }),
        }),
      ),
    );
    fixture.detectChanges();

    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.selectOption({ text: "urgent" });

    expect(storyApi.createTagAssignment).toHaveBeenCalledWith("tag-3", { projectId: "project-1", ref: 1 });
    expect(TestBed.inject(StoryDetailStore).item()?.tagIds).toEqual(["tag-3", "tag-1"]);
  });

  it("keeps the input empty after selecting without typing", async () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-3", label: "urgent" })]);
    const story = makeStoryDetail({ ref: 1, projectId: "project-1", tagIds: [] });
    TestBed.inject(StoryDetailStore).set(story);
    fixture.componentRef.setInput("story", story);
    fixture.componentRef.setInput("hasModifyPermission", true);
    storyApi.createTagAssignment.mockReturnValue(
      of(
        makeStoryTagAssign({
          tag: makeStoryTagWithCount({ id: "tag-3", label: "urgent" }),
          story: makeStoryNested({ ref: 1 }),
        }),
      ),
    );
    fixture.detectChanges();

    const autocomplete = await loader.getHarness(MatAutocompleteHarness);
    await autocomplete.selectOption({ text: "urgent" });

    expect(await autocomplete.getValue()).toBe("");
  });

  it("the cross unassigns", async () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug" }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature" }),
    ]);
    const story = makeStoryDetail({ ref: 1, projectId: "project-1", tagIds: ["tag-1", "tag-2"] });
    TestBed.inject(StoryDetailStore).set(story);
    fixture.componentRef.setInput("story", story);
    fixture.componentRef.setInput("hasModifyPermission", true);
    storyApi.deleteTagAssignment.mockReturnValue(of(undefined));
    fixture.detectChanges();
    const removeButton = await loader.getHarness(MatButtonHarness.with({ iconName: "close" }));
    expect(removeButton).not.toBeNull();
    await removeButton.click();
    await fixture.whenStable();

    expect(storyApi.deleteTagAssignment).toHaveBeenCalledWith({ projectId: "project-1", ref: 1, tagId: "tag-1" });
    expect(TestBed.inject(StoryDetailStore).item()?.tagIds).toEqual(["tag-2"]);
  });

  it("read-only without permission", () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug" })]);
    fixture.componentRef.setInput("story", makeStoryDetail({ ref: 1, tagIds: ["tag-1"] }));
    fixture.componentRef.setInput("hasModifyPermission", false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(chipLabels()).toEqual(["bug"]);
    expect(element.querySelector("button.mat-mdc-chip-remove")).toBeNull();
    expect(element.querySelector("input")).toBeNull();
  });

  it("explicit message when the project has no tags", () => {
    fixture.componentRef.setInput("story", makeStoryDetail({ ref: 1, tagIds: [] }));
    fixture.componentRef.setInput("hasModifyPermission", true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain("No tags in this project");
    expect(element.querySelector("input")).toBeNull();
  });
});
