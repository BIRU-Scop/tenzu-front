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
import { userEvent } from "vitest/browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColorPickerComponent } from "./color-picker.component";
import { TAG_COLOR_COUNT } from "@tenzu/repository/story-tag/story-tag.model";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe(ColorPickerComponent.name, () => {
  let fixture: ComponentFixture<ColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerComponent],
      providers: [testingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPickerComponent);
  });

  const swatches = () =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="radio"]'));

  it("displays one swatch per palette color and emits the selection", () => {
    fixture.componentRef.setInput("value", 1);
    fixture.detectChanges();

    expect(swatches()).toHaveLength(TAG_COLOR_COUNT);

    swatches()[4].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(5);
    expect(swatches()[4].checked).toBe(true);
  });

  it("is operable with the keyboard as a radiogroup", async () => {
    fixture.componentRef.setInput("value", 1);
    fixture.detectChanges();

    swatches()[0].focus();
    await userEvent.keyboard("{ArrowRight}");
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(2);
    expect(swatches()[1].checked).toBe(true);
    expect(document.activeElement).toBe(swatches()[1]);

    swatches().forEach((input, index) => {
      expect(input.getAttribute("aria-label")).toBe(`Color ${index + 1}`);
    });
  });
});
