/*
 * Copyright (C) 2024-2026 BIRU
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
import { of } from "rxjs";

import { DeleteComponent } from "./delete.component";
import { UserStore } from "@tenzu/repository/user/user.store";
import { UserService } from "@tenzu/repository/user/user.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";
import { getByRole, queryByRole } from "@tenzu/utils/testing/aria-role";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";

describe("DeleteComponent", () => {
  let fixture: ComponentFixture<DeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteComponent],
      providers: [...testingProviders],
    }).compileComponents();
    vi.spyOn(TestBed.inject(UserService), "getDeleteInfo").mockReturnValue(
      of({
        onlyOwnerCollectiveWorkspaces: [],
        onlyOwnerCollectiveProjects: [],
        onlyMemberWorkspaces: [],
        onlyMemberProjects: [],
      }) as never,
    );
    fixture = TestBed.createComponent(DeleteComponent);
    fixture.detectChanges();
  });

  function consentAndSubmit(): void {
    fixture.componentInstance.form.controls.consent.setValue(true);
    fixture.componentInstance.confirmDialog();
    fixture.detectChanges();
  }

  it("the confirm button of the deletion dialog has aria-disabled true while the DELETE request is pending", async () => {
    vi.spyOn(TestBed.inject(UserStore), "deleteUser").mockReturnValue(new Promise(() => undefined));
    const loader = TestbedHarnessEnvironment.loader(fixture);

    consentAndSubmit();
    await fixture.whenStable();

    const confirm = await loader.getHarness(MatButtonHarness.with({ text: /delete my account/i }));
    expect(await (await confirm.host()).getAttribute("aria-disabled")).toBe("true");
  });

  it("the confirm button of the deletion dialog renders the progress spinner while the DELETE request is pending", async () => {
    vi.spyOn(TestBed.inject(UserStore), "deleteUser").mockReturnValue(new Promise(() => undefined));
    const loader = TestbedHarnessEnvironment.loader(fixture);

    consentAndSubmit();
    await fixture.whenStable();

    const confirm = await loader.getHarness(MatButtonHarness.with({ text: /delete my account/i }));
    expect(await (await confirm.getHarness(MatProgressSpinnerHarness)).host()).toBeDefined();
  });

  it("the deletion dialog renders the element with role alert with the deletion_failed message when the DELETE request fails", async () => {
    vi.spyOn(TestBed.inject(UserStore), "deleteUser").mockRejectedValue(new Error("server error"));

    consentAndSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getByRole(fixture.nativeElement, "alert").textContent?.trim()).toBe(
      translation("settings.delete.deletion_failed"),
    );
  });

  it("the deletion dialog renders no element with role alert before any request", () => {
    expect(queryByRole(fixture.nativeElement, "alert")).toBeNull();
  });
});
