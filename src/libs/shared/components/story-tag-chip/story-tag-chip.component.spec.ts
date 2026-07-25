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

import { StoryTagChipComponent } from "./story-tag-chip.component";
import { makeStoryTag } from "@tenzu/repository/story-tag/story-tag.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatChipRemoveHarness } from "@angular/material/chips/testing";

describe(StoryTagChipComponent.name, () => {
  let fixture: ComponentFixture<StoryTagChipComponent>;
  let loader: HarnessLoader;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryTagChipComponent],
      providers: [testingProviders],
    }).compileComponents();
    fixture = TestBed.createComponent(StoryTagChipComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("displays the label and the color class", () => {
    fixture.componentRef.setInput("tag", makeStoryTag({ label: "bug", color: 3 }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain("bug");
    expect(element.querySelector(".tag-color-3")).not.toBeNull();
  });

  it("shows the remove cross only when removable", async () => {
    const removeButton = async () => await loader.getHarness(MatChipRemoveHarness);
    fixture.componentRef.setInput("tag", makeStoryTag({ label: "bug" }));
    fixture.detectChanges();
    expect((await loader.getAllHarnesses(MatChipRemoveHarness)).length).toBe(0);

    fixture.componentRef.setInput("removable", true);
    fixture.detectChanges();
    const button = await removeButton();
    expect(button).not.toBeNull();

    let removedCount = 0;
    fixture.componentInstance.removed.subscribe(() => removedCount++);
    await button.click();
    expect(removedCount).toBe(1);
  });
});
