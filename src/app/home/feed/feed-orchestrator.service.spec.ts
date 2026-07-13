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
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { FeedOrchestratorService } from "./feed-orchestrator.service";
import { FeedDialog } from "./feed-dialog/feed-dialog";
import { TypedDialogService } from "@tenzu/utils/services/typed-dialog-service/typed-dialog.service";
import { makeFeedItem } from "@tenzu/utils/testing/factories";
import { mockService } from "@tenzu/utils/testing/mocks";
import { FeedStore } from "@tenzu/repository/feed/feed.store";
import { FeedApiService } from "@tenzu/repository/feed/feed-api.service";

describe("FeedOrchestratorService", () => {
  let orchestrator: FeedOrchestratorService;
  let store: InstanceType<typeof FeedStore>;
  let api: Mocked<FeedApiService>;
  let dialog: Mocked<TypedDialogService>;
  let afterClosed$: Subject<void>;

  beforeEach(() => {
    api = mockService(FeedApiService);
    dialog = mockService(TypedDialogService);
    afterClosed$ = new Subject<void>();
    dialog.openWhenIdle.mockReturnValue(
      of({ afterClosed: () => afterClosed$ } as unknown as MatDialogRef<FeedDialog, void>),
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: FeedApiService, useValue: api },
        { provide: TypedDialogService, useValue: dialog },
      ],
    });
    store = TestBed.inject(FeedStore);
    orchestrator = TestBed.inject(FeedOrchestratorService);
  });

  it("opens the modal when there are unread items", () => {
    store.setAllEntities([makeFeedItem({ id: "m1" })]);

    TestBed.tick();

    expect(dialog.openWhenIdle).toHaveBeenCalledTimes(1);
    expect(dialog.openWhenIdle).toHaveBeenCalledWith(FeedDialog, expect.anything());
  });

  it("does not open the modal if there are no unread", () => {
    store.setAllEntities([makeFeedItem({ id: "m1", readAt: "2026-01-01T00:00:00.000Z" })]);

    TestBed.tick();

    expect(dialog.openWhenIdle).not.toHaveBeenCalled();
  });

  it("opens in alertdialog when maintenance is present", () => {
    store.setAllEntities([makeFeedItem({ id: "m1", type: "maintenance" })]);

    TestBed.tick();

    expect(dialog.openWhenIdle).toHaveBeenCalledWith(FeedDialog, expect.objectContaining({ role: "alertdialog" }));
  });

  it("does not reopen the modal after a first opening if the store is modified with a new unread item", () => {
    store.setAllEntities([makeFeedItem({ id: "m1" })]);
    TestBed.tick();
    expect(dialog.openWhenIdle).toHaveBeenCalledTimes(1);
    afterClosed$.next();

    store.setEntity(makeFeedItem({ id: "m2" }));
    TestBed.tick();

    expect(dialog.openWhenIdle).toHaveBeenCalledTimes(1);
  });

  it("does not open a second modal while one is open", () => {
    orchestrator.openModal();
    orchestrator.openModal();

    expect(dialog.openWhenIdle).toHaveBeenCalledTimes(1);
  });

  it("loads the feed on startup and opens the modal if there are unread items", async () => {
    api.list.mockReturnValue(of([makeFeedItem({ id: "m1" })]));

    await orchestrator.init();
    TestBed.tick();

    expect(store.sortedEntities()).toHaveLength(1);
    expect(dialog.openWhenIdle).toHaveBeenCalledTimes(1);
  });
});
