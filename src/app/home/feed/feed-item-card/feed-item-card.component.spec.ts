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
import { TranslocoTestingModule } from "@jsverse/transloco";
import { FeedItemCardComponent } from "./feed-item-card.component";
import { FeedItem } from "@tenzu/repository/feed";
import { makeFeedItem } from "@tenzu/utils/testing/factories";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatButtonHarness } from "@angular/material/button/testing";

const FEED_TRANSLATIONS = {
  feed: {
    action: { new_tab: "(new tab)" },
  },
};

describe("FeedItemCardComponent", () => {
  let fixture: ComponentFixture<FeedItemCardComponent>;
  let loader: HarnessLoader;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FeedItemCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: FEED_TRANSLATIONS },
          translocoConfig: { availableLangs: ["en"], defaultLang: "en" },
          preloadLangs: true,
        }),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FeedItemCardComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  function mount(item: FeedItem): HTMLElement {
    fixture.componentRef.setInput("feeditem", item);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("title", () => {
    const el = mount(makeFeedItem({ title: "Tenzu needs you!" }));

    expect(el.querySelector("h3")?.textContent).toContain("Tenzu needs you!");
  });

  it("release illustration", () => {
    const el = mount(makeFeedItem({ type: "release" }));

    const img = el.querySelector<HTMLImageElement>("img");
    expect(img?.getAttribute("src")).toContain("feeds_release.svg");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("maintenance illustration", () => {
    const el = mount(makeFeedItem({ type: "maintenance" }));
    const img = el.querySelector<HTMLImageElement>("img");
    expect(img?.getAttribute("src")).toContain("feeds_maintenance.svg");
  });

  it("makes the markdown content sanitized", () => {
    const el = mount(makeFeedItem({ content: "[link](https://example.org)<script>alert(1)</script>" }));

    expect(el.querySelector("a[href='https://example.org']")).toBeTruthy();
    expect(el.querySelector("script")).toBeNull();
  });

  it("does not display an action when actionUrl is empty", async () => {
    mount(makeFeedItem({ actionTitle: "", actionUrl: "" }));
    expect(await loader.getHarnessOrNull(MatButtonHarness)).toBeNull();
  });

  it("actionUrl is corrected rendered", async () => {
    const el = mount(makeFeedItem({ actionUrl: "https://example.org/survey" }));

    const button = await loader.getHarness(MatButtonHarness);
    const host = await button.host();
    expect(await host.getAttribute("href")).toBe("https://example.org/survey");
    expect(el.textContent).toContain("(new tab)");
  });
});
