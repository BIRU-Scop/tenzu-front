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
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressBarHarness } from "@angular/material/progress-bar/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatTooltipHarness } from "@angular/material/tooltip/testing";
import { MatIconHarness } from "@angular/material/icon/testing";
import { By } from "@angular/platform-browser";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { inputBinding, outputBinding, signal } from "@angular/core";
import { provideTranslocoLocale } from "@jsverse/transloco-locale";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";
import { getByRole, queryByRole } from "@tenzu/utils/testing/aria-role";
import {
  buttonFilterByAriaLabel,
  buttonFilterByText,
  getEnabledButtonNames,
} from "@tenzu/utils/testing/button-harness";
import { makeTusUpload } from "@tenzu/repository/importation/tus-upload.factories";
import { TusUpload } from "@tenzu/repository/importation/tus-upload.model";
import { DEADLINE_FORMAT, TusUploadCardComponent } from "./tus-upload-card.component";
import { TranslocoLocaleService } from "@jsverse/transloco-locale";
import { MEGABYTE } from "@tenzu/pipes/humanize-file-size";

describe(TusUploadCardComponent.name, () => {
  let fixture: ComponentFixture<TusUploadCardComponent>;
  let loader: HarnessLoader;
  let documentRootLoader: HarnessLoader;
  // The bound input
  const tusUpload = signal(makeTusUpload());
  const outputs = {
    paused: vi.fn(),
    resumed: vi.fn(),
    canceled: vi.fn(),
    retried: vi.fn(),
    closed: vi.fn(),
    detailsOpened: vi.fn(),
    resumedWith: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({
      imports: [TusUploadCardComponent],
      providers: [testingProviders, provideTranslocoLocale()],
    }).compileComponents();
    fixture = TestBed.createComponent(TusUploadCardComponent, {
      bindings: [
        inputBinding("tusUpload", tusUpload),
        ...Object.entries(outputs).map(([name, handler]) => outputBinding(name, handler)),
      ],
    });
    loader = TestbedHarnessEnvironment.loader(fixture);
    documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  const setCardWith = (upload: TusUpload): Promise<MatCardHarness> => {
    tusUpload.set(upload);
    return loader.getHarness(MatCardHarness);
  };

  const deadline = (expiresAt: string): string =>
    TestBed.inject(TranslocoLocaleService).localizeDate(new Date(expiresAt), undefined, DEADLINE_FORMAT);

  it("renders the file name as the aria-label of the card", async () => {
    await setCardWith(makeTusUpload({ fileName: "backup.json" }));

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute("role")).toBe("group");
    expect(host.getAttribute("aria-label")).toBe("backup.json");
  });

  it("renders the file name as a tooltip", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json" }));

    const tooltip = await card.getHarness(MatTooltipHarness);
    await tooltip.show();

    expect(await tooltip.getTooltipText()).toBe("backup.json");
  });

  it("renders the uploading state with pause and cancel", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "uploading" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.uploading"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.pause", { fileName: "backup.json" }),
      translation("commons.cancel"),
    ]);
  });

  it("renders the progress as the percentage of the bytes sent", async () => {
    const card = await setCardWith(makeTusUpload({ bytesSent: 50, fileSize: 200 }));

    expect(await (await card.getHarness(MatProgressBarHarness)).getValue()).toBe(25);
  });

  it("renders the status text in the element with role status", async () => {
    await setCardWith(makeTusUpload({ status: "uploading" }));

    expect(getByRole(fixture.nativeElement, "status").textContent).toContain(
      translation("project.new_project.upload.status.uploading"),
    );
  });

  it("renders the file name as the aria-label of the progress bar", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json" }));

    const progressBar = await (await card.getHarness(MatProgressBarHarness)).host();
    expect(await progressBar.getAttribute("aria-label")).toBe(
      translation("project.new_project.upload.progress_label", { fileName: "backup.json" }),
    );
  });

  it("renders the paused state with resume and cancel", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "paused" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.paused"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.resume", { fileName: "backup.json" }),
      translation("commons.cancel"),
    ]);
  });

  it("renders the resume deadline of a paused upload", async () => {
    const card = await setCardWith(makeTusUpload({ status: "paused", expiresAt: "2026-10-05T14:30:00.000Z" }));

    expect(await card.getText()).toContain(`Resume possible until ${deadline("2026-10-05T14:30:00.000Z")}`);
  });

  // The `role="status"` element is an `aria-live="polite"` region: a screen reader reads its content on every
  // change. With the deadline inside, each state change (pause, resume, retry...) would read "Upload paused,
  // Resume possible until Oct 5, 2026, 2:30 PM" in full.
  it("renders the deadline outside the element with role status", async () => {
    await setCardWith(makeTusUpload({ status: "paused", expiresAt: "2026-10-05T14:30:00.000Z" }));

    expect(getByRole(fixture.nativeElement, "status").textContent).not.toContain(deadline("2026-10-05T14:30:00.000Z"));
  });

  it("keeps the selection on the main button, regardless of the state", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "uploading" }));
    const pauseButton = await card.getHarness(
      buttonFilterByAriaLabel(translation("project.new_project.upload.actions.pause", { fileName: "backup.json" })),
    );
    await pauseButton.focus();
    const focusedWhileUploading = document.activeElement;

    await setCardWith(makeTusUpload({ fileName: "backup.json", status: "paused" }));

    const resumeButton = await card.getHarness(
      buttonFilterByAriaLabel(translation("project.new_project.upload.actions.resume", { fileName: "backup.json" })),
    );
    expect(await resumeButton.isFocused()).toBe(true);
    expect(document.activeElement).toBe(focusedWhileUploading);
    expect(await (await resumeButton.getHarness(MatIconHarness)).getName()).toBe("resume");
  });

  it("renders the retrying state with pause and cancel", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "retrying" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.retrying"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.pause", { fileName: "backup.json" }),
      translation("commons.cancel"),
    ]);
  });

  it("renders the resuming state with cancel", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "resuming" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.resuming"));
    expect(await getEnabledButtonNames(card)).toEqual([translation("commons.cancel")]);
  });

  it("renders the canceling state with no button", async () => {
    const card = await setCardWith(makeTusUpload({ status: "canceling" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.canceling"));
    expect(await getEnabledButtonNames(card)).toEqual([]);
  });

  it("renders the failed state with retry and cancel", async () => {
    const card = await setCardWith(
      makeTusUpload({ status: "failed", errorKey: "project.new_project.upload.status.server_not_responding" }),
    );

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.server_not_responding"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.retry"),
      translation("commons.cancel"),
    ]);
  });

  it("renders the rejected state with details and close on file refused", async () => {
    const card = await setCardWith(
      makeTusUpload({
        fileName: "backup.json",
        status: "rejected",
        errorKey: "project.new_project.upload.status.file_refused",
        errorMessage: "Suspicious file, try to shorten the file name",
      }),
    );

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.file_refused"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.details"),
      translation("commons.close"),
    ]);
  });

  it("renders the rejected state with close on forbidden", async () => {
    const card = await setCardWith(
      makeTusUpload({ status: "rejected", errorKey: "project.new_project.upload.status.forbidden" }),
    );

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.forbidden"));
    expect(await getEnabledButtonNames(card)).toEqual([translation("commons.close")]);
  });

  it.each(["failed", "rejected"] as const)(
    "renders the cause of a %s upload in the element with role alert",
    async (status) => {
      await setCardWith(makeTusUpload({ status, errorKey: "project.new_project.upload.status.server_not_responding" }));

      expect(getByRole(fixture.nativeElement, "alert").textContent).toContain(
        translation("project.new_project.upload.status.server_not_responding"),
      );
      expect(queryByRole(fixture.nativeElement, "status")).toBeNull();
    },
  );

  it("renders the interrupted state with choose file and cancel", async () => {
    const card = await setCardWith(makeTusUpload({ status: "interrupted" }));

    expect(await card.getText()).toContain(translation("project.new_project.upload.status.interrupted"));
    expect(await getEnabledButtonNames(card)).toEqual([
      translation("project.new_project.upload.actions.choose_file"),
      translation("commons.cancel"),
    ]);
  });

  it("renders the interrupted hint with the file name and size", async () => {
    const card = await setCardWith(
      makeTusUpload({ status: "interrupted", fileName: "backup.json", fileSize: 12 * MEGABYTE }),
    );

    expect(await card.getText()).toContain("Select backup.json (12 MB) again to resume.");
  });

  it("emits paused", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "uploading" }));

    await (
      await card.getHarness(
        buttonFilterByAriaLabel(translation("project.new_project.upload.actions.pause", { fileName: "backup.json" })),
      )
    ).click();

    expect(outputs.paused).toHaveBeenCalledOnce();
  });

  it("emits resumed", async () => {
    const card = await setCardWith(makeTusUpload({ fileName: "backup.json", status: "paused" }));

    await (
      await card.getHarness(
        buttonFilterByAriaLabel(translation("project.new_project.upload.actions.resume", { fileName: "backup.json" })),
      )
    ).click();

    expect(outputs.resumed).toHaveBeenCalledOnce();
    expect(outputs.paused).not.toHaveBeenCalled();
  });

  it("emits canceled after confirmation", async () => {
    const card = await setCardWith(
      makeTusUpload({ fileName: "backup.json", status: "uploading", bytesSent: 50, fileSize: 200 }),
    );
    await (await card.getHarness(buttonFilterByText(translation("commons.cancel")))).click();

    const dialog = await documentRootLoader.getHarness(MatDialogHarness);
    expect(await dialog.getText()).toContain("Cancel the upload of backup.json? The 25% already sent will be lost.");
    await (await dialog.getHarness(buttonFilterByText("Cancel the upload"))).click();

    expect(outputs.canceled).toHaveBeenCalledOnce();
  });

  it("emits closed without confirmation", async () => {
    const card = await setCardWith(
      makeTusUpload({ status: "rejected", errorKey: "project.new_project.upload.status.forbidden" }),
    );

    await (await card.getHarness(buttonFilterByText(translation("commons.close")))).click();

    expect(outputs.closed).toHaveBeenCalledOnce();
    expect(await documentRootLoader.hasHarness(MatDialogHarness)).toBe(false);
  });

  it("emits retried", async () => {
    const card = await setCardWith(
      makeTusUpload({ status: "failed", errorKey: "project.new_project.upload.status.server_not_responding" }),
    );

    await (await card.getHarness(buttonFilterByText(translation("project.new_project.upload.actions.retry")))).click();

    expect(outputs.retried).toHaveBeenCalledOnce();
  });

  it("emits detailsOpened", async () => {
    const card = await setCardWith(
      makeTusUpload({
        status: "rejected",
        errorKey: "project.new_project.upload.status.file_refused",
        errorMessage: "Suspicious file, try to shorten the file name",
      }),
    );

    await (
      await card.getHarness(buttonFilterByText(translation("project.new_project.upload.actions.details")))
    ).click();

    expect(outputs.detailsOpened).toHaveBeenCalledOnce();
  });

  it("emits resumedWith with the selected file", async () => {
    await setCardWith(makeTusUpload({ status: "interrupted" }));
    const selected = new File(["{}"], "backup.json", { type: "application/json" });

    const fileInput: FileInputComponent = fixture.debugElement.query(
      By.directive(FileInputComponent),
    ).componentInstance;
    fileInput.selectFile.emit(selected);

    expect(outputs.resumedWith).toHaveBeenCalledExactlyOnceWith(selected);
  });
});
