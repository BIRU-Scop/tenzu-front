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

import { afterEach, describe, expect, it, vi } from "vitest";

import { WsDocProvider } from "./index";

describe(WsDocProvider.name, () => {
  let wsDocProvider: WsDocProvider;

  const makeWsDocProvider = (): WsDocProvider => {
    wsDocProvider = new WsDocProvider({
      serverUrl: "ws://localhost/collaboration",
      roomName: "project-1/42",
      wsOpts: { connect: false, disableBc: true },
    });
    return wsDocProvider;
  };

  afterEach(() => {
    wsDocProvider.provider.destroy();
  });

  it("cleanUp calls destroy on the WebsocketProvider", () => {
    const destroy = vi.spyOn(makeWsDocProvider().provider, "destroy");

    wsDocProvider.cleanUp();

    expect(destroy).toHaveBeenCalledOnce();
  });

  it("cleanUp calls destroy on the doc", () => {
    const destroy = vi.spyOn(makeWsDocProvider().provider.doc, "destroy");

    wsDocProvider.cleanUp();

    expect(destroy).toHaveBeenCalledOnce();
  });

  it("a pagehide event calls destroy on the WebsocketProvider", () => {
    const destroy = vi.spyOn(makeWsDocProvider().provider, "destroy");

    window.dispatchEvent(new Event("pagehide"));

    expect(destroy).toHaveBeenCalledOnce();
  });
});
