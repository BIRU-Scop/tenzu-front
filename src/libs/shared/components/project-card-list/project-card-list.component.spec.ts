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
import { inputBinding, signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";
import { buttonFilterByText } from "@tenzu/utils/testing/button-harness";
import { makeWorkspaceSummary } from "@tenzu/repository/workspace/workspace.factories";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";
import { makeProjectImportation } from "@tenzu/repository/importation/importation.factories";
import { makeTusUploadState } from "@tenzu/repository/importation/tus-upload.factories";
import { TusUploadState } from "@tenzu/repository/importation/tus-upload.model";
import { TusUploadRepositoryService } from "@tenzu/repository/importation/tus-upload-repository.service";
import { TusUploadCardComponent } from "@tenzu/shared/components/tus-upload-card/tus-upload-card.component";
import { ProjectCardListComponent } from "./project-card-list.component";

describe(ProjectCardListComponent.name, () => {
  let fixture: ComponentFixture<ProjectCardListComponent>;
  let loader: HarnessLoader;
  let documentRootLoader: HarnessLoader;
  const workspace = signal(makeWorkspaceSummary({ id: "workspace-1" }));
  const focusFallback = signal<HTMLElement | null>(null);
  const tusUploadRepositoryServiceMock = {
    entities: signal<TusUploadState[]>([]),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    close: vi.fn(),
    resumeWith: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    tusUploadRepositoryServiceMock.entities.set([]);
    workspace.set(makeWorkspaceSummary({ id: "workspace-1" }));
    focusFallback.set(null);
    await TestBed.configureTestingModule({
      imports: [ProjectCardListComponent],
      providers: [testingProviders, { provide: TusUploadRepositoryService, useValue: tusUploadRepositoryServiceMock }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectCardListComponent, {
      bindings: [inputBinding("workspace", workspace), inputBinding("focusFallback", focusFallback)],
    });
    loader = TestbedHarnessEnvironment.loader(fixture);
    documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  const getCardTags = (): string[] => {
    const element = fixture.nativeElement as HTMLElement;
    return [...element.querySelectorAll("app-tus-upload-card, app-project-importation-card, app-project-card")].map(
      (card) => card.tagName.toLowerCase(),
    );
  };

  const renderList = (state: { tusUploadStates: TusUploadState[]; workspace: WorkspaceSummary }): void => {
    tusUploadRepositoryServiceMock.entities.set(state.tusUploadStates);
    workspace.set(state.workspace);
    fixture.detectChanges();
  };

  const getUploadCard = (): TusUploadCardComponent =>
    fixture.debugElement.query(By.directive(TusUploadCardComponent)).componentInstance;

  const hasEmptyState = (): boolean =>
    (fixture.nativeElement as HTMLElement).textContent?.includes(
      translation("component.project_card.create_first_project"),
    ) ?? false;

  it("renders upload cards before importation cards", () => {
    renderList({
      tusUploadStates: [makeTusUploadState({ workspaceId: "workspace-1" })],
      workspace: makeWorkspaceSummary({ id: "workspace-1", userImportedProjects: [makeProjectImportation()] }),
    });

    expect(getCardTags()).toEqual(["app-tus-upload-card", "app-project-importation-card"]);
  });

  it("renders no card for an upload of another workspace", () => {
    renderList({
      tusUploadStates: [makeTusUploadState({ workspaceId: "workspace-2" })],
      workspace: makeWorkspaceSummary({ id: "workspace-1" }),
    });

    expect(getCardTags()).not.toContain("app-tus-upload-card");
  });

  it("renders no empty state when an upload exists", () => {
    renderList({
      tusUploadStates: [makeTusUploadState({ workspaceId: "workspace-1" })],
      workspace: makeWorkspaceSummary({ id: "workspace-1" }),
    });

    expect(hasEmptyState()).toBe(false);
  });

  it.each([
    ["pause", "paused"],
    ["resume", "resumed"],
    ["cancel", "canceled"],
    ["retry", "retried"],
    ["close", "closed"],
  ] as const)("calls %s on the repository when the card emits %s", (method, output) => {
    const tusUploadState = makeTusUploadState({ workspaceId: "workspace-1" });
    renderList({ tusUploadStates: [tusUploadState], workspace: makeWorkspaceSummary({ id: "workspace-1" }) });

    getUploadCard()[output].emit();

    expect(tusUploadRepositoryServiceMock[method]).toHaveBeenCalledExactlyOnceWith(tusUploadState.id);
  });

  it("calls resumeWith on the repository when the card emits resumedWith", () => {
    const tusUploadState = makeTusUploadState({ workspaceId: "workspace-1", status: "interrupted" });
    renderList({ tusUploadStates: [tusUploadState], workspace: makeWorkspaceSummary({ id: "workspace-1" }) });
    const selected = new File(["{}"], "backup.json", { type: "application/json" });

    getUploadCard().resumedWith.emit(selected);

    expect(tusUploadRepositoryServiceMock.resumeWith).toHaveBeenCalledExactlyOnceWith(tusUploadState.id, selected);
  });

  it("opens the error dialog on details", async () => {
    renderList({
      tusUploadStates: [
        makeTusUploadState({ workspaceId: "workspace-1", fileName: "backup.json", status: "rejected" }),
      ],
      workspace: makeWorkspaceSummary({ id: "workspace-1" }),
    });

    getUploadCard().detailsOpened.emit();

    const dialog = await documentRootLoader.getHarness(MatDialogHarness);
    expect(await dialog.getTitleText()).toBe(
      translation("project.new_project.upload.details_title", { fileName: "backup.json" }),
    );
  });

  it("moves focus to the replacing importation card when an upload card is removed", async () => {
    renderList({
      tusUploadStates: [makeTusUploadState({ workspaceId: "workspace-1", fileName: "backup.json" })],
      workspace: makeWorkspaceSummary({ id: "workspace-1" }),
    });
    await (await loader.getHarness(buttonFilterByText(translation("commons.cancel")))).focus();

    renderList({
      tusUploadStates: [],
      workspace: makeWorkspaceSummary({
        id: "workspace-1",
        userImportedProjects: [makeProjectImportation({ sourceName: "backup.json" })],
      }),
    });
    await fixture.whenStable();

    const importationCard = (fixture.nativeElement as HTMLElement).querySelector("app-project-importation-card");
    expect(importationCard?.contains(document.activeElement)).toBe(true);
  });

  it("moves focus to the list heading when an upload card is removed without replacement", async () => {
    const heading = document.body.appendChild(document.createElement("h1"));
    heading.tabIndex = -1;
    focusFallback.set(heading);
    renderList({
      tusUploadStates: [makeTusUploadState({ workspaceId: "workspace-1", fileName: "backup.json" })],
      workspace: makeWorkspaceSummary({ id: "workspace-1" }),
    });
    await (await loader.getHarness(buttonFilterByText(translation("commons.cancel")))).focus();

    renderList({ tusUploadStates: [], workspace: makeWorkspaceSummary({ id: "workspace-1" }) });
    await fixture.whenStable();

    expect(document.activeElement).toBe(heading);
    heading.remove();
  });
});
