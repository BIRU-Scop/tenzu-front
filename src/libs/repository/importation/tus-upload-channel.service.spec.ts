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
import { ErrorHandler } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { ZodError } from "zod/v4";
import { TusUploadChannel } from "./tus-upload-channel.service";
import { makeTusUploadState } from "./tus-upload.factories";
import { TusUploadState } from "./tus-upload.model";

describe(TusUploadChannel.name, () => {
  let sender: TusUploadChannel;
  let receiver: TusUploadChannel;
  const errorHandlerMock = { handleError: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: errorHandlerMock }] });
    sender = TestBed.inject(TusUploadChannel);
    receiver = TestBed.runInInjectionContext(() => new TusUploadChannel());
  });

  it("publishState emits the state on another channel's state$", async () => {
    const tusUploadState = makeTusUploadState({ id: "abc" });
    const received = firstValueFrom(receiver.state$);

    sender.publishState(tusUploadState);

    expect(await received).toEqual(tusUploadState);
  });

  it("sendCommand emits the command on another channel's command$", async () => {
    const received = firstValueFrom(receiver.command$);

    sender.sendCommand("pause", "abc");

    expect(await received).toEqual({ type: "pause", id: "abc" });
  });

  it("publishRemoved emits the id on another channel's removed$", async () => {
    const received = firstValueFrom(receiver.removed$);

    sender.publishRemoved("abc");

    expect(await received).toBe("abc");
  });

  it("a message that does not match the schema is ignored", async () => {
    const emitted: TusUploadState[] = [];
    receiver.state$.subscribe((tusUploadState) => emitted.push(tusUploadState));
    const raw = new BroadcastChannel("tusUploads");

    raw.postMessage({ type: "state", upload: {} });

    await vi.waitFor(() => expect(errorHandlerMock.handleError).toHaveBeenCalled());

    for (const [error] of errorHandlerMock.handleError.mock.calls) {
      expect(error).toBeInstanceOf(ZodError);
    }
    expect(emitted).toEqual([]);
    raw.close();
  });
});
