/*
 * Copyright (C) 2025-2026 BIRU
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

import { SessionChannelService } from "./session-channel.service";
import { ExitReason } from "./session-machine";

describe(SessionChannelService.name, () => {
  let sender: SessionChannelService;
  let receiver: SessionChannelService;
  const errorHandlerMock = { handleError: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: errorHandlerMock }] });
    sender = TestBed.inject(SessionChannelService);
    receiver = TestBed.runInInjectionContext(() => new SessionChannelService());
  });

  const postRaw = (message: unknown): void => {
    const raw = new BroadcastChannel("tenzu:session");
    raw.postMessage(message);
    raw.close();
  };

  it("announceEnded on one SessionChannelService instance emits the reason on ended$ of another instance", async () => {
    const received = firstValueFrom(receiver.ended$);

    sender.announceEnded("refreshExpired");

    expect(await received).toBe("refreshExpired");
  });

  it("announceEnded on one SessionChannelService instance does not emit on its own ended$", async () => {
    const emitted: ExitReason[] = [];
    sender.ended$.subscribe((reason) => emitted.push(reason));
    const received = firstValueFrom(receiver.ended$);

    sender.announceEnded("refreshExpired");
    await received;

    expect(emitted).toEqual([]);
  });

  it("a message whose reason is not an ExitReason calls errorHandler.handleError with a ZodError", async () => {
    postRaw({ type: "ended", reason: "sessionEndedElsewhere" });

    await vi.waitFor(() => expect(errorHandlerMock.handleError).toHaveBeenCalled());
    expect(errorHandlerMock.handleError.mock.calls[0][0]).toBeInstanceOf(ZodError);
  });

  it("a message whose reason is not an ExitReason emits nothing on ended$", async () => {
    const emitted: ExitReason[] = [];
    receiver.ended$.subscribe((reason) => emitted.push(reason));

    postRaw({ type: "ended", reason: "sessionEndedElsewhere" });
    await vi.waitFor(() => expect(errorHandlerMock.handleError).toHaveBeenCalled());

    expect(emitted).toEqual([]);
  });

  it("a message whose type is not ended calls errorHandler.handleError with a ZodError", async () => {
    postRaw({ type: "started", username: "alice" });

    await vi.waitFor(() => expect(errorHandlerMock.handleError).toHaveBeenCalled());
    expect(errorHandlerMock.handleError.mock.calls[0][0]).toBeInstanceOf(ZodError);
  });

  it("a message whose type is not ended emits nothing on ended$", async () => {
    const emitted: ExitReason[] = [];
    receiver.ended$.subscribe((reason) => emitted.push(reason));

    postRaw({ type: "started", username: "alice" });
    await vi.waitFor(() => expect(errorHandlerMock.handleError).toHaveBeenCalled());

    expect(emitted).toEqual([]);
  });

  it("a message posted after destroy emits nothing on ended$", async () => {
    const emitted: ExitReason[] = [];
    sender.ended$.subscribe((reason) => emitted.push(reason));
    TestBed.resetTestingModule();
    const probe = new BroadcastChannel("tenzu:session");
    const delivered = new Promise<void>((resolve) => (probe.onmessage = () => resolve()));

    postRaw({ type: "ended", reason: "refreshExpired" });
    await delivered;
    probe.close();

    expect(emitted).toEqual([]);
  });
});
