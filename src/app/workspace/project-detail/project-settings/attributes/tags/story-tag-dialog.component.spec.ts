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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatDialogRef } from "@angular/material/dialog";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatFormFieldHarness } from "@angular/material/form-field/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { provideTranslocoScope } from "@jsverse/transloco";

import { StoryTagDialogComponent } from "./story-tag-dialog.component";
import { StoryTagApiService } from "@tenzu/repository/story-tag/story-tag-api.service";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { mockService } from "@tenzu/utils/testing/mocks";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(StoryTagDialogComponent.name, () => {
  let fixture: ComponentFixture<StoryTagDialogComponent>;
  let tagsStore: InstanceType<typeof StoryTagEntitiesSummaryStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryTagDialogComponent],
      providers: [
        testingProviders,
        provideTranslocoScope("project"),
        { provide: StoryTagApiService, useValue: mockService(StoryTagApiService) },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
    fixture = TestBed.createComponent(StoryTagDialogComponent);
  });

  it("enforces the zod payload constraints on the label", async () => {
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const labelField = await loader.getHarness(MatFormFieldHarness);
    const labelInput = await loader.getHarness(MatInputHarness);
    const createButton = await loader.getHarness(MatButtonHarness.with({ text: /Create Tag/ }));

    await labelInput.setValue("");
    await labelInput.blur();
    expect(await labelField.getTextErrors()).toEqual(["The name is required."]);
    expect(await createButton.isDisabled()).toBe(true);

    await labelInput.setValue("x".repeat(51));
    await labelInput.blur();
    expect(await labelField.getTextErrors()).toEqual(["50 characters maximum."]);
    expect(await createButton.isDisabled()).toBe(true);

    await labelInput.setValue("   ");
    await labelInput.blur();
    expect(await labelField.getTextErrors()).toEqual(["The name is required."]);
    expect(await createButton.isDisabled()).toBe(true);

    await labelInput.setValue("bug\u200bfix");
    await labelInput.blur();
    expect(await labelField.getTextErrors()).toEqual(["The name contains invalid characters."]);
    expect(await createButton.isDisabled()).toBe(true);
  });

  it("refuses an already taken label (case-insensitive)", async () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug" })]);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const labelField = await loader.getHarness(MatFormFieldHarness);
    const labelInput = await loader.getHarness(MatInputHarness);
    await labelInput.setValue("Bug");
    await labelInput.blur();

    expect(await labelField.getTextErrors()).toEqual(["A tag with this name already exists."]);
    const createButton = await loader.getHarness(MatButtonHarness.with({ text: /Create Tag/ }));
    expect(await createButton.isDisabled()).toBe(true);
    expect(await labelInput.getValue()).toBe("Bug");
  });
});
