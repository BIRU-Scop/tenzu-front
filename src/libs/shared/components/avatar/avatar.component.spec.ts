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

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarComponent } from "./avatar.component";

describe("AvatarComponent", () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("outlined mode paints text and border with the background tone", () => {
    fixture.componentRef.setInput("mode", "outlined");
    fixture.componentRef.setInput("color", 3);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.color).toBe("var(--color-3-background)");
    expect(host.style.borderColor).toBe("var(--color-3-background)");
    expect(host.style.backgroundColor).toBe("transparent");
  });

  it("input Norma Fisher -> ouput N F", () => {
    fixture.componentRef.setInput("name", "Norma Fisher");
    expect(component.initials()).toEqual("NF");
  });

  it("input / Norma Fisher -> ouput / N", () => {
    fixture.componentRef.setInput("name", "/ Norma Fisher");
    expect(component.initials()).toEqual("/N");
  });

  it("input Norma ? Fisher -> ouput N ?", () => {
    fixture.componentRef.setInput("name", "Norma ? Fisher");
    expect(component.initials()).toEqual("N?");
  });

  it(" input Norma 🤖 Fisher -> ouput N", () => {
    fixture.componentRef.setInput("name", "Norma 🤖 Fisher");
    expect(component.initials()).toEqual("N");
  });

  it(" input 🤖 Norma Fisher -> ouput 🤖", () => {
    fixture.componentRef.setInput("name", "🤖 Norma Fisher");
    expect(component.initials()).toEqual("🤖");
  });
});
