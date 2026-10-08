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
import { inputBinding, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";
import { makeTusUploadState } from "@tenzu/repository/importation/tus-upload.factories";
import { TusUploadErrorDialog } from "./tus-upload-error-dialog.component";

describe(TusUploadErrorDialog.name, () => {
  let fixture: ComponentFixture<TusUploadErrorDialog>;
  const tusUploadState = signal(makeTusUploadState());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TusUploadErrorDialog],
      providers: [testingProviders, { provide: MatDialogRef, useValue: {} }],
    }).compileComponents();
    fixture = TestBed.createComponent(TusUploadErrorDialog, {
      bindings: [inputBinding("tusUploadState", tusUploadState)],
    });
  });

  it("renders the file name, the cause and the full message", () => {
    tusUploadState.set(
      makeTusUploadState({
        fileName: "backup.json",
        status: "rejected",
        errorKey: "project.new_project.upload.status.file_refused",
        errorMessage: "Suspicious file <b>foo</b>",
      }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain("backup.json");
    expect(element.textContent).toContain(translation("project.new_project.upload.status.file_refused"));
    expect(element.textContent).toContain("Suspicious file <b>foo</b>");
    expect(element.querySelector("b")).toBeNull();
  });
});
