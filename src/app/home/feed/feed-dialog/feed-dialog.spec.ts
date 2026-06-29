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

import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FeedDialog } from "./feed-dialog";
import { FeedRepositoryService } from "@tenzu/repository/feed";
import { makeFeedItem } from "@tenzu/utils/testing/factories";
import { mockService } from "@tenzu/utils/testing/mocks";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { FeedStore } from "@tenzu/repository/feed/feed.store";
import { FeedApiService } from "@tenzu/repository/feed/feed-api.service";

describe("FeedDialog", () => {
  let fixture: ComponentFixture<FeedDialog>;
  let store: InstanceType<typeof FeedStore>;
  let repository: FeedRepositoryService;
  let api: Mocked<FeedApiService>;

  beforeEach(async () => {
    api = mockService(FeedApiService);

    await TestBed.configureTestingModule({
      imports: [FeedDialog],
      providers: [
        ...testingProviders,
        { provide: FeedApiService, useValue: api },
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();

    store = TestBed.inject(FeedStore);
    repository = TestBed.inject(FeedRepositoryService);
    vi.spyOn(repository, "markRead").mockResolvedValue(undefined);

    fixture = TestBed.createComponent(FeedDialog);
    fixture.detectChanges();
  });

  it("displays a single item at a time (carousel) with a dot per item", () => {
    store.setAllEntities([
      makeFeedItem({ id: "a", type: "maintenance" }),
      makeFeedItem({ id: "b", type: "release" }),
      makeFeedItem({ id: "c", type: "call_to_action" }),
    ]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll("app-feed-item-card")).toHaveLength(1);
    expect(el.querySelectorAll(".rounded-full")).toHaveLength(3);
  });

  it("marks the active element seen upon display", () => {
    store.setAllEntities([makeFeedItem({ id: "a" }), makeFeedItem({ id: "b" })]);
    fixture.detectChanges();

    expect(repository.markRead).toHaveBeenCalledWith({ ids: ["a"] });
  });

  it("mark the next element seen after navigation", () => {
    store.setAllEntities([makeFeedItem({ id: "a" }), makeFeedItem({ id: "b" })]);
    fixture.detectChanges();

    fixture.componentInstance.next();
    fixture.detectChanges();

    expect(repository.markRead).toHaveBeenCalledWith({ ids: ["b"] });
  });
});
