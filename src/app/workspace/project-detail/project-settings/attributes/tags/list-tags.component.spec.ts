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
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { provideTranslocoScope } from "@jsverse/transloco";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

import ListTagsComponent from "./list-tags.component";
import { StoryTagApiService } from "@tenzu/repository/story-tag/story-tag-api.service";
import { StoryTagEntitiesSummaryStore } from "@tenzu/repository/story-tag/story-tag-entities.store";
import { makeStoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.factories";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { makeProjectDetail } from "@tenzu/repository/project/project.factories";
import { NotificationService } from "@tenzu/utils/services/notification";
import { mockService } from "@tenzu/utils/testing/mocks";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(ListTagsComponent.name, () => {
  let fixture: ComponentFixture<ListTagsComponent>;
  let tagsStore: InstanceType<typeof StoryTagEntitiesSummaryStore>;
  let api: Mocked<StoryTagApiService>;

  beforeEach(async () => {
    api = mockService(StoryTagApiService);
    await TestBed.configureTestingModule({
      imports: [ListTagsComponent],
      providers: [
        testingProviders,
        // The real route provides this scope (project-settings/routes.ts).
        provideTranslocoScope("project"),
        { provide: StoryTagApiService, useValue: api },
        { provide: NotificationService, useValue: mockService(NotificationService) },
      ],
    }).compileComponents();

    tagsStore = TestBed.inject(StoryTagEntitiesSummaryStore);
    fixture = TestBed.createComponent(ListTagsComponent);
  });

  it("lists the tags with their counters", () => {
    tagsStore.setAllEntities([
      makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3, storiesCount: 0 }),
      makeStoryTagWithCount({ id: "tag-2", label: "feature", color: 5, storiesCount: 4 }),
      makeStoryTagWithCount({ id: "tag-3", label: "urgent", color: 1, storiesCount: 1 }),
    ]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const rows = element.querySelectorAll(".app-table-row");
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain("bug");
    expect(rows[1].textContent).toContain("feature");
    expect(rows[1].textContent).toContain("4 related stories");
    expect(rows[2].textContent).toContain("1 related story");
    expect(rows[2].textContent).not.toContain("1 related stories");
    expect(element.querySelector(".tag-color-3")).not.toBeNull();
    expect(element.querySelector(".tag-color-5")).not.toBeNull();
  });

  it("shows an empty state when the project has no tags", async () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll(".app-table-row")).toHaveLength(0);
    expect(element.textContent).toContain("No tags yet");
    const loader = TestbedHarnessEnvironment.loader(fixture);
    expect(await loader.hasHarness(MatButtonHarness.with({ text: /Tag/ }))).toBe(true);
  });

  it("opens the dialog from + Tag and creates", async () => {
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: "project-1" }));
    api.create.mockReturnValue(of(makeStoryTagWithCount({ id: "tag-1", label: "urgent", color: 1, storiesCount: 0 })));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const addButton = await loader.getHarness(MatButtonHarness.with({ text: /Tag/ }));
    await addButton.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const labelInput = await rootLoader.getHarness(MatInputHarness);
    await labelInput.setValue("urgent");
    const createButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Create Tag/ }));
    await createButton.click();
    fixture.detectChanges();

    expect(api.create).toHaveBeenCalledWith({ label: "urgent", color: 1 }, { projectId: "project-1" });
    const rows = element.querySelectorAll(".app-table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain("urgent");
  });

  it("toasts a domain message when the backend refuses the creation (400)", async () => {
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: "project-1" }));
    api.create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { error: { code: "bad-request", detail: "story-tag-label-already-exists", msg: "..." } },
          }),
      ),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const addButton = await loader.getHarness(MatButtonHarness.with({ text: /Tag/ }));
    await addButton.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const labelInput = await rootLoader.getHarness(MatInputHarness);
    await labelInput.setValue("urgent");
    const createButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Create Tag/ }));
    await createButton.click();
    await fixture.whenStable();

    const notificationService = TestBed.inject(NotificationService) as Mocked<NotificationService>;
    expect(notificationService.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "project.settings.attributes.tags.errors.conflict",
        translocoTitle: true,
        translocoTitleParams: { label: "urgent" },
      }),
      expect.anything(),
    );
    expect(element.querySelectorAll(".app-table-row")).toHaveLength(0);
  });

  it("opens the prefilled dialog from the edit button and patches the tag", async () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug", color: 3, storiesCount: 4 })]);
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: "project-1" }));
    api.patch.mockReturnValue(of(makeStoryTagWithCount({ id: "tag-1", label: "defect", color: 3, storiesCount: 4 })));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const editButton = await loader.getHarness(MatButtonHarness.with({ selector: '[aria-label="Edit the tag bug"]' }));
    await editButton.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const labelInput = await rootLoader.getHarness(MatInputHarness);
    expect(await labelInput.getValue()).toBe("bug");

    await labelInput.setValue("defect");
    const saveButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Save/ }));
    await saveButton.click();
    fixture.detectChanges();

    expect(api.patch).toHaveBeenCalledWith({ label: "defect", color: 3 }, { tagId: "tag-1" }, undefined);
    const rows = element.querySelectorAll(".app-table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain("defect");
  });

  it("toasts when deleting a tag already deleted by a concurrent client (404)", async () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug", storiesCount: 0 })]);
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: "project-1" }));
    api.delete.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[aria-label="Delete the tag bug"]' }),
    );
    await deleteButton.click();
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Delete/ }));
    await confirmButton.click();
    await fixture.whenStable();

    const notificationService = TestBed.inject(NotificationService) as Mocked<NotificationService>;
    expect(notificationService.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: "project.settings.attributes.tags.errors.gone", translocoTitle: true }),
      expect.anything(),
    );
  });

  it("asks for confirmation quoting storiesCount before deleting", async () => {
    tagsStore.setAllEntities([makeStoryTagWithCount({ id: "tag-1", label: "bug", storiesCount: 4 })]);
    TestBed.inject(ProjectRepositoryService).setEntityDetail(makeProjectDetail({ id: "project-1" }));
    api.delete.mockReturnValue(of(undefined));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[aria-label="Delete the tag bug"]' }),
    );
    await deleteButton.click();

    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const confirmDialog = await rootLoader.getHarness(MatDialogHarness);
    expect(await confirmDialog.getText()).toContain("4");

    const confirmButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Delete/ }));
    await confirmButton.click();
    fixture.detectChanges();

    expect(api.delete).toHaveBeenCalledWith({ tagId: "tag-1" }, undefined);
    expect(element.querySelectorAll(".app-table-row")).toHaveLength(0);
  });
});
