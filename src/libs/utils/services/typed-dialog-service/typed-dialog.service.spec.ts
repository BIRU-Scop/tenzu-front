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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TypedDialog, TypedDialogService } from "./typed-dialog.service";

class StubDialog extends TypedDialog<void, void> {}

describe("TypedDialogService", () => {
  let service: TypedDialogService;

  let openDialogs: unknown[];
  let afterAllClosed$: Subject<void>;
  let openSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    openDialogs = [];
    afterAllClosed$ = new Subject<void>();
    openSpy = vi.fn(() => {
      const ref = { afterClosed: () => new Subject<void>() } as unknown as MatDialogRef<unknown>;
      openDialogs.push(ref);
      return ref;
    });
    const matDialogMock = {
      get openDialogs() {
        return openDialogs;
      },
      afterAllClosed: afterAllClosed$,
      open: openSpy,
    };

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: matDialogMock }],
    });
    service = TestBed.inject(TypedDialogService);
  });

  it("opens immediately when no modal is open", () => {
    const emitted: unknown[] = [];
    service.openWhenIdle<void, void>(StubDialog).subscribe((ref) => emitted.push(ref));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(emitted).toHaveLength(1); // la ref est émise tout de suite
  });

  it("waits for the modal to open if one is already open, then opens upon its closing", () => {
    openDialogs = [{}];
    const emitted: unknown[] = [];
    service.openWhenIdle<void, void>(StubDialog).subscribe((ref) => emitted.push(ref));

    expect(openSpy).not.toHaveBeenCalled();
    expect(emitted).toHaveLength(0);

    openDialogs = [];
    afterAllClosed$.next();

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(emitted).toHaveLength(1);
  });

  it("processes pending requests one by one", () => {
    openDialogs = [{}];
    service.openWhenIdle<void, void>(StubDialog, { id: "first" });
    service.openWhenIdle<void, void>(StubDialog, { id: "second" });
    expect(openSpy).not.toHaveBeenCalled();

    openDialogs = [];
    afterAllClosed$.next();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenLastCalledWith(StubDialog, { id: "first" });

    openDialogs = [];
    afterAllClosed$.next();
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenLastCalledWith(StubDialog, { id: "second" });
  });
});
