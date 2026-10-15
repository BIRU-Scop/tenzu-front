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
import { inputBinding, signal } from "@angular/core";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";

import { ButtonComponent } from "./button.component";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { translation } from "@tenzu/utils/testing/translation";

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let loader: HarnessLoader;
  const loading = signal(false);
  const iconOnly = signal(false);

  beforeEach(() => {
    loading.set(false);
    iconOnly.set(false);
    TestBed.configureTestingModule({ providers: [testingProviders] });
    fixture = TestBed.createComponent(ButtonComponent, {
      bindings: [
        inputBinding("level", signal("primary")),
        inputBinding("translocoKey", signal("commons.save")),
        inputBinding("iconName", signal("save")),
        inputBinding("loading", loading),
        inputBinding("iconOnly", iconOnly),
      ],
    });
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it.each([false, true])(
    "loading true sets aria-disabled to true on the button for iconOnly %s",
    async (isIconOnly) => {
      iconOnly.set(isIconOnly);
      loading.set(true);

      const button = await loader.getHarness(MatButtonHarness);

      expect(await (await button.host()).getAttribute("aria-disabled")).toBe("true");
    },
  );

  it("loading true does not set the disabled attribute on the button", async () => {
    loading.set(true);

    const button = await loader.getHarness(MatButtonHarness);

    expect(await (await button.host()).getAttribute("disabled")).toBeNull();
  });

  it.each([false, true])(
    "loading true renders the progress spinner with aria-label commons.loading for iconOnly %s",
    async (isIconOnly) => {
      iconOnly.set(isIconOnly);
      loading.set(true);

      const spinner = await loader.getHarness(MatProgressSpinnerHarness);

      expect(await (await spinner.host()).getAttribute("aria-label")).toBe(translation("commons.loading"));
    },
  );

  it("loading true does not propagate a click of the button to the host", async () => {
    loading.set(true);
    const hostClick = vi.fn();
    (fixture.nativeElement as HTMLElement).addEventListener("click", hostClick);

    await (await loader.getHarness(MatButtonHarness)).click();

    expect(hostClick).not.toHaveBeenCalled();
  });

  it("loading true sets pointer-events to none on the host", async () => {
    loading.set(true);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).style.pointerEvents).toBe("none");
  });

  it("loading false renders no progress spinner", async () => {
    expect(await loader.hasHarness(MatProgressSpinnerHarness)).toBe(false);
  });
});
