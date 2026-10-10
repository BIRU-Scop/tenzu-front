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
import { inputBinding, outputBinding } from "@angular/core";
import { By } from "@angular/platform-browser";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { HttpStatusCode } from "@angular/common/http";
import { NotificationService } from "@tenzu/utils/services/notification";
import { makeTusError } from "@tenzu/utils/services/tus-client/tus-client.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";
import { mockService } from "@tenzu/utils/testing/mocks";
import { TusUploadRepositoryService } from "@tenzu/repository/importation/tus-upload-repository.service";
import { ProjectImportationType } from "@tenzu/repository/importation/importation.model";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { ProjectImportationInputComponent } from "./project-importation-input.component";

describe(ProjectImportationInputComponent.name, () => {
  let fixture: ComponentFixture<ProjectImportationInputComponent>;
  const tusUploadRepositoryServiceMock = { start: vi.fn() };
  const liveAnnouncerMock = mockService(LiveAnnouncer);
  const notificationServiceMock = mockService(NotificationService);
  const submittedMock = vi.fn();
  const file = new File(["{}"], "backup.json", { type: "application/json" });

  beforeEach(async () => {
    vi.resetAllMocks();
    tusUploadRepositoryServiceMock.start.mockResolvedValue(undefined);
    liveAnnouncerMock.announce.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [ProjectImportationInputComponent],
      providers: [
        testingProviders,
        { provide: TusUploadRepositoryService, useValue: tusUploadRepositoryServiceMock },
        { provide: LiveAnnouncer, useValue: liveAnnouncerMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectImportationInputComponent, {
      bindings: [inputBinding("workspaceId", () => "workspace-1"), outputBinding("submitted", submittedMock)],
    });
    fixture.detectChanges();
  });

  const selectFile = async (selected: File): Promise<void> => {
    const fileInput: FileInputComponent = fixture.debugElement.query(
      By.directive(FileInputComponent),
    ).componentInstance;
    fileInput.selectFile.emit(selected);
    await fixture.whenStable();
  };

  it("emits submitted when the upload is started", async () => {
    await selectFile(file);

    expect(tusUploadRepositoryServiceMock.start).toHaveBeenCalledExactlyOnceWith({
      file,
      workspaceId: "workspace-1",
      originType: ProjectImportationType.TAIGA,
    });
    expect(submittedMock).toHaveBeenCalledOnce();
  });

  it("announces the start with the file name", async () => {
    await selectFile(file);

    expect(liveAnnouncerMock.announce).toHaveBeenCalledExactlyOnceWith("Upload of backup.json started");
  });

  it("notifies without emitting submitted when the creation fails", async () => {
    tusUploadRepositoryServiceMock.start.mockRejectedValue(makeTusError(HttpStatusCode.PayloadTooLarge));

    await selectFile(file);

    expect(submittedMock).not.toHaveBeenCalled();
    expect(notificationServiceMock.error).toHaveBeenCalledExactlyOnceWith({
      title: "project.new_project.upload.notifications.failed",
      translocoTitle: true,
      translocoTitleParams: { fileName: "backup.json" },
    });
  });

  it("renders the keep a tab open hint", () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(translation("project.new_project.upload.keep_tab_open"));
  });
});
