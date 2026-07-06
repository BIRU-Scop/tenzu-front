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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatSlideToggleHarness } from "@angular/material/slide-toggle/testing";
import { MockControlPanelComponent } from "./mock-control-panel.component";
import { HarnessLoader } from "@angular/cdk/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { DomainMockStore } from "./mock-state";
import { MatBadgeHarness } from "@angular/material/badge/testing";
import { MOCK_DOMAINS } from "./mock-handlers";
import { MockDomain } from "./mock.types";

class CdkDialogHarness extends MatDialogHarness {
  static override hostSelector = ".cdk-dialog-container";
}

const ORIGINAL_DOMAINS = [...MOCK_DOMAINS];
function setDomains(...names: string[]): void {
  MOCK_DOMAINS.length = 0;
  MOCK_DOMAINS.push(...names.map((name) => ({ name, handlers: [] }) as MockDomain));
}

describe(MockControlPanelComponent.name, () => {
  let fixture: ComponentFixture<MockControlPanelComponent>;
  let rootLoader: HarnessLoader;
  let store: InstanceType<typeof DomainMockStore>;

  beforeEach(async () => {
    localStorage.clear();
    setDomains("feed", "stories");
    await TestBed.configureTestingModule({ imports: [MockControlPanelComponent] }).compileComponents();
    store = TestBed.inject(DomainMockStore);
    fixture = TestBed.createComponent(MockControlPanelComponent);
    fixture.detectChanges();
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  afterEach(() => {
    localStorage.clear();
    MOCK_DOMAINS.length = 0;
    MOCK_DOMAINS.push(...ORIGINAL_DOMAINS);
  });

  it("the FAB is rendered, the dialog is closed by default", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    expect(fab).not.toBeNull();
    expect(await rootLoader.getAllHarnesses(CdkDialogHarness)).toHaveLength(0);
  });

  it("opens on click, one row (slug + toggle + source badge) per domain", async () => {
    store.enableDomainMock("feed", true); // feed on → source "domain" ; stories reste off → "default"

    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();

    const toggles = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    expect(toggles).toHaveLength(2);
    expect(await toggles[0].getLabelText()).toContain("feed");
    expect(await toggles[0].isChecked()).toBe(true);
    expect(await toggles[1].getLabelText()).toContain("stories");
    expect(await toggles[1].isChecked()).toBe(false);
    const dialog = await rootLoader.getHarness(CdkDialogHarness);
    const dialogText = await (await dialog.host()).text();
    expect(dialogText).toContain("domain");
    expect(dialogText).toContain("default");
  });

  it("Close dialog returns focus to the FAB", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.focus();
    await fab.click();

    const dialog = await rootLoader.getHarness(CdkDialogHarness);
    expect(dialog).not.toBeNull();
    expect(await fab.isFocused()).toBeFalsy();
    await dialog.close();

    expect(await rootLoader.getAllHarnesses(CdkDialogHarness)).toHaveLength(0);
    expect(await fab.isFocused()).toBeTruthy();
  });

  it("toggling a domain updates the store and marks it dirty/pending", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();

    const toggles = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    await toggles[1].check();

    expect(store.isDomainMocked("stories")).toBeTruthy();

    const dialog = document.querySelector("[role='dialog']")!;

    expect(dialog.querySelectorAll("[data-testid='mockRowPending']")).toHaveLength(1);
    const badge = await rootLoader.getHarness(MatBadgeHarness.with({ text: "!" }));
    expect(await badge.isHidden()).toBeFalsy();
  });

  it("enable all sets the global flag and checks every toggle", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();
    const enableAllButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Enable all/ }));
    await enableAllButton.click();

    expect(store.global()).toBe(true);

    const toggles = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    expect(await toggles[0].isChecked()).toBe(true);
    expect(await toggles[1].isChecked()).toBe(true);

    const badge = await rootLoader.getHarness(MatBadgeHarness.with({ text: "!" }));
    expect(await badge.isHidden()).toBeFalsy();
  });

  it("disable all (reset) turns everything off", async () => {
    store.enableDomainMock("feed", true);
    store.enableGlobal(true);

    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();

    const disableAllButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /Disable all/ }));
    await disableAllButton.click();

    expect(store.global()).toBe(false);
    expect(store.anyDomainMocked()).toBe(false);

    const toggles = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    expect(await toggles[0].isChecked()).toBe(false);
  });

  it("the FAB is active when at least one domain is mocked", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    const fabHost = await fab.host();
    expect(await fabHost.hasClass("grayscale")).toBeTruthy();

    store.enableDomainMock("feed", true);
    expect(await fabHost.hasClass("grayscale")).toBeFalsy();
  });

  it("the FAB dirty badge survives closing the panel", async () => {
    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();

    const [toggle] = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    await toggle.check();
    const dialog = await rootLoader.getHarness(CdkDialogHarness);
    await dialog.close();

    const badge = await rootLoader.getHarness(MatBadgeHarness.with({ text: "!" }));
    expect(await badge.isHidden()).toBeFalsy();
  });

  it("reload triggers a page reload", async () => {
    const reloadSpy = vi.spyOn(fixture.componentInstance, "reload").mockImplementation(() => undefined);

    const fab = await rootLoader.getHarness(MatButtonHarness.with({ variant: "fab" }));
    await fab.click();

    const [toggle] = await rootLoader.getAllHarnesses(MatSlideToggleHarness);
    await toggle.check();

    const reloadButton = await rootLoader.getHarness(MatButtonHarness.with({ variant: "icon", iconName: "refresh" }));
    await reloadButton.click();

    expect(reloadSpy).toHaveBeenCalledOnce();
  });
});
