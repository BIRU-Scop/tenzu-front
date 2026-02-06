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
import { signal } from "@angular/core";

/**
 * Represents an online user in the collaborative editing session
 */
export type OnlineUser = {
  /** Display name of the user */
  name: string;
  /** Assigned color for user identification in the editor */
  color: string;
  /** Unique identifier of the user */
  id: string;
};

/**
 * WebSocket Document Provider for Yjs collaborative editing.
 * Manages real-time document synchronization and user awareness.
 */
export class WsDocProvider {
  provider: WebsocketProvider;
  /** Signal tracking the list of currently online users */
  onlineUsers = signal<OnlineUser[]>([]);
  /** Signal indicating the connection status */
  connected = signal<boolean>(false);

  /**
   * Initialize the WebSocket provider for collaborative document editing
   * @param serverUrl - The WebSocket server URL
   * @param roomName - The unique room identifier for this document session
   */
  constructor({ serverUrl, roomName }: { serverUrl: string; roomName: string }) {
    // Initialize Yjs WebSocket provider with a new document
    this.provider = new WebsocketProvider(serverUrl, roomName, new Y.Doc());
    // Listen for connection status changes
    this.provider.on("status", (event) => {
      if (event.status === "disconnected") {
        this.connected.set(false);
      }
      if (event.status === "connected" && this.provider.ws) {
        this.connected.set(true);
        const originalOnMessage = this.provider.ws.onmessage;

        // Intercept WebSocket messages to handle custom save status responses
        // This allows us to handle server-specific commands without interfering
        // with Yjs protocol messages
        this.provider.ws.onmessage = (messageEvent: MessageEvent) => {
          // Handle text messages (custom server commands)
          if (typeof messageEvent.data === "string") {
            try {
              const data = JSON.parse(messageEvent.data);
              // Intercept save status responses from the server
              if (data.type === "save_status") {
                debug("yjs", "Save successful!", data);
                return; // Don't forward this message to Yjs
              }
            } catch {
              // Not valid JSON, pass it through
            }
          }

          // Forward binary messages (Yjs updates) to the original handler
          if (originalOnMessage && this.provider.ws) {
            originalOnMessage.call(this.provider.ws, messageEvent);
          }
        };
      }
    });

    // Track changes in user presence
    this.provider.awareness.on("change", this.handleAwarenessUpdate);

    // Clean up when the page is hidden/closed
    window.addEventListener("pagehide", this.handlePageHide, { once: true });
  }

  /**
   * Clean up resources and disconnect the provider
   */
  cleanUp() {
    window.removeEventListener("pagehide", this.handlePageHide);
    this.provider.awareness.off("change", this.handleAwarenessUpdate);
    this.provider.destroy?.();
    this.provider.doc.destroy();
  }

  /**
   * Handler for page hide event - ensures proper cleanup
   *
   * Called automatically when the user navigates away or closes the tab.
   */
  handlePageHide = () => {
    this.cleanUp();
  };

  /**
   * Update the list of online users based on awareness state changes
   */
  handleAwarenessUpdate = () => {
    const states = this.provider.awareness.getStates();
    const users = [] as OnlineUser[];
    const seenIds = new Set<string>();

    // Extract unique users from awareness states
    states.forEach((state) => {
      if (state["user"]) {
        const user = state["user"] as OnlineUser;
        // Skip duplicate users (e.g., same user in multiple tabs)
        if (seenIds.has(user.id)) return;
        seenIds.add(user.id);
        users.push(user);
      }
    });
    this.onlineUsers.set(users);
  };

  /**
   * Request the server to save the current document state
   */
  save() {
    if (this.provider.wsconnected) {
      this.provider.ws?.send(
        JSON.stringify({
          command: "save_now",
        }),
      );
    }
  }
}
