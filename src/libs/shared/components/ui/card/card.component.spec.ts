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
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { CardComponent } from "./card.component";

describe(CardComponent.name, () => {
  let fixture: ComponentFixture<CardComponent>;
  const backdrop = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [testingProviders],
    }).compileComponents();
    fixture = TestBed.createComponent(CardComponent, {
      bindings: [
        inputBinding("name", () => "backup.json"),
        inputBinding("description", () => "Lorem Ipsum"),
        inputBinding("backdrop", backdrop),
      ],
    });
  });

  const getHiddenFlags = (): (string | null)[] => {
    const element = fixture.nativeElement as HTMLElement;
    return ["mat-card-header", "mat-card-content"].map(
      (selector) => element.querySelector(selector)?.getAttribute("aria-hidden") ?? null,
    );
  };

  it("sets aria-hidden to true on the header and the content when the backdrop is on", () => {
    backdrop.set(true);
    fixture.detectChanges();

    expect(getHiddenFlags()).toEqual(["true", "true"]);
  });

  it("sets aria-hidden to false on the header and the content when the backdrop is off", () => {
    backdrop.set(false);
    fixture.detectChanges();

    expect(getHiddenFlags()).toEqual(["false", "false"]);
  });
});
