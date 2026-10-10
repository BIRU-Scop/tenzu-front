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

import { beforeEach, describe, expect, it } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { testingProviders } from "./testings-providers";
import { buttonFilterByAriaLabel, buttonFilterByText, getEnabledButtonNames } from "./button-harness";

@Component({
  imports: [MatButton, MatIconButton, MatIcon],
  template: `
    <button matIconButton aria-label="Pause the upload"><mat-icon>pause</mat-icon></button>
    <button matButton><mat-icon>cancel</mat-icon>Cancel</button>
    <button matButton disabled>Retry</button>
  `,
})
class ButtonsHostComponent {}

describe("button harness helpers", () => {
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testingProviders });
    loader = TestbedHarnessEnvironment.loader(TestBed.createComponent(ButtonsHostComponent));
  });

  it("buttonFilterByAriaLabel finds the button of that aria-label", async () => {
    const button = await loader.getHarness(buttonFilterByAriaLabel("Pause the upload"));

    expect(await (await button.host()).getAttribute("aria-label")).toBe("Pause the upload");
  });

  it("buttonFilterByText finds the button of that text behind its icon", async () => {
    const button = await loader.getHarness(buttonFilterByText("Cancel"));

    expect(await button.getText()).toBe("cancelCancel");
  });

  it("getEnabledButtonNames returns the aria-label or the text of the enabled buttons in DOM order", async () => {
    expect(await getEnabledButtonNames(loader)).toEqual(["Pause the upload", "Cancel"]);
  });
});
