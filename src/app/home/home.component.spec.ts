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

import { beforeEach, describe, expect, it, Mocked } from "vitest";
import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgEventBus } from "ng-event-bus";
import HomeComponent from "./home.component";
import { FeedOrchestratorService } from "./feed/feed-orchestrator.service";
import { NotificationsComponentService } from "./notifications/notifications-component.service";
import { UserStore } from "@tenzu/repository/user";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { PLUGINS_TOKEN } from "../app.config";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { MatBadgeHarness } from "@angular/material/badge/testing";

describe("HomeComponent", () => {
  let fixture: ComponentFixture<HomeComponent>;
  let feedOrchestrator: Mocked<FeedOrchestratorService>;
  const unreadCount = signal(0);
  let loader: HarnessLoader;

  beforeEach(async () => {
    unreadCount.set(0);

    feedOrchestrator = Object.assign(mockService(FeedOrchestratorService), { unreadCount });
    feedOrchestrator.init.mockResolvedValue([]);
    const notifications = Object.assign(mockService(NotificationsComponentService), {
      count: { unread: signal(0) },
    });
    notifications.getCount.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        ...testingProviders,
        { provide: FeedOrchestratorService, useValue: feedOrchestrator },
        { provide: NotificationsComponentService, useValue: notifications },
        {
          provide: UserStore,
          useValue: { myUser: signal({ fullName: "Jane Doe", color: 1, email: "jane@tenzu.io" }) },
        },
        { provide: RelativeDialogService, useValue: {} },
        { provide: NgEventBus, useValue: {} },
        { provide: PLUGINS_TOKEN, useValue: [] },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  async function getNewsMenuItem() {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const [news] = await menu.getItems({ text: /news/i });
    return news;
  }

  it("opens the feed modal on click on the Announcements item", async () => {
    const news = await getNewsMenuItem();
    await news.click();
    expect(feedOrchestrator.openModal).toHaveBeenCalledTimes(1);
  });

  it("visible badge with the number of unread items", async () => {
    unreadCount.set(3);
    const news = await getNewsMenuItem();
    const badge = await news.getHarness(MatBadgeHarness);
    expect(await badge.isHidden()).toBeFalsy();
    expect(await badge.getText()).toContain("3");
  });

  it("badge hidden when there are no unread", async () => {
    unreadCount.set(0);
    const news = await getNewsMenuItem();
    const badge = await news.getHarness(MatBadgeHarness);
    expect(await badge.isHidden()).toBeTruthy();
  });
});
