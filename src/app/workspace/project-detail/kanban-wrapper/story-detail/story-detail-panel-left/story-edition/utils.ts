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

import { debug } from "@tenzu/utils/functions/logging";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export function initWsDocProvider({ serverUrl, roomName, doc }: { serverUrl: string; roomName: string; doc: Y.Doc }) {
  const wsProvider = new WebsocketProvider(serverUrl, roomName, doc, { maxBackoffTime: 1 });

  // We want to be able to receive commands from the server, but we need to catch them so that yjs doesn't try to execute them
  wsProvider.on("status", (event) => {
    if (event.status === "connected" && wsProvider.ws) {
      const originalOnMessage = wsProvider.ws.onmessage;

      // Replace the message handler with ours to catch string returns from ws commands
      wsProvider.ws.onmessage = (messageEvent: MessageEvent) => {
        // If it's text (our save JSON), we process it
        if (typeof messageEvent.data === "string") {
          try {
            const data = JSON.parse(messageEvent.data);
            if (data.type === "save_status") {
              debug("yjs", "Sauvegarde réussie !", data);
              return; // STOP: Do not forward to Yjs
            }
          } catch {
            // Not a valid JSON, let it pass just in case
          }
        }

        // Otherwise (binary), we call the original Yjs handler
        if (originalOnMessage && wsProvider.ws) {
          originalOnMessage.call(wsProvider.ws, messageEvent);
        }
      };
    }
  });

  return wsProvider;
}
